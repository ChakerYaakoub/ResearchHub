"""Admin-panel list/manage views (admin-ui Origin + platform ADMIN)."""

from django.db.models import Count, Prefetch, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from experiments.models import Experiment, ExperimentStatus
from invitations.models import Invitation, InvitationStatus
from invitations.services import InvitationError, cancel_invitation
from proposals.models import Proposal, ProposalStatus
from publications.models import Publication, PublicationKind
from users.models import GlobalRole, User

from core.admin_filters import (
    apply_is_active,
    apply_user_search,
    invalid_choice_response,
    query_bool,
    query_search,
)
from core.api import ADMIN_PERMS, SUPER_ADMIN_PERMS, api_error
from projects.models import ProjectMembership, ProjectStatus, ResearchProject
from projects.selectors import is_super_admin

from .serializers import (
    AdminCreateAdminSerializer,
    AdminExperimentSerializer,
    AdminInvitationSerializer,
    AdminProjectDetailSerializer,
    AdminProjectListSerializer,
    AdminProposalSerializer,
    AdminPublicationSerializer,
    AdminUserPatchSerializer,
    AdminUserSerializer,
)


class AdminUserListView(APIView):
    """GET researchers (default); POST create ADMIN (super admin only)."""

    def get_permissions(self):
        if self.request.method == "POST":
            return [perm() for perm in SUPER_ADMIN_PERMS]
        return [perm() for perm in ADMIN_PERMS]

    def get(self, request):
        # Default / ?role=RESEARCHER → researchers only (Users page).
        role = (request.query_params.get("role") or GlobalRole.RESEARCHER).strip().upper()
        if role != GlobalRole.RESEARCHER:
            return Response(
                {"detail": "Use GET /api/admin/admins/ for admin accounts."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        is_active = query_bool(request, "is_active")
        if is_active == "invalid":
            return Response(
                {"detail": "Invalid is_active. Use true or false."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        qs = User.objects.filter(role=GlobalRole.RESEARCHER).order_by("email")
        qs = apply_user_search(qs, query_search(request))
        qs = apply_is_active(qs, is_active)
        return Response(AdminUserSerializer(qs, many=True).data)

    def post(self, request):
        ser = AdminCreateAdminSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        return Response(
            AdminUserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class AdminAdminListView(APIView):
    """GET `/api/admin/admins/` — SUPER_ADMIN only; ADMIN + SUPER_ADMIN accounts."""

    permission_classes = SUPER_ADMIN_PERMS

    def get(self, request):
        is_active = query_bool(request, "is_active")
        if is_active == "invalid":
            return Response(
                {"detail": "Invalid is_active. Use true or false."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        qs = User.objects.filter(
            role__in=(GlobalRole.ADMIN, GlobalRole.SUPER_ADMIN)
        ).order_by("email")
        qs = apply_user_search(qs, query_search(request))
        qs = apply_is_active(qs, is_active)
        return Response(AdminUserSerializer(qs, many=True).data)


class AdminUserDetailView(APIView):
    """PATCH `/api/admin/users/{id}/` — is_active only (not self)."""

    permission_classes = ADMIN_PERMS

    def patch(self, request, user_id: int):
        target = get_object_or_404(User, pk=user_id)
        if target.pk == request.user.pk:
            return Response(
                {"detail": "You cannot change your own active status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # SUPER_ADMIN accounts are never deactivated via the admin API.
        if target.role == GlobalRole.SUPER_ADMIN:
            return Response(
                {"detail": "Super admin accounts cannot be deactivated."},
                status=status.HTTP_403_FORBIDDEN,
            )
        # Only SUPER_ADMIN may activate/deactivate ADMIN accounts.
        if target.role == GlobalRole.ADMIN:
            if not is_super_admin(request.user):
                return Response(
                    {"detail": "Only a super admin can change admin accounts."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        ser = AdminUserPatchSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        target.is_active = ser.validated_data["is_active"]
        target.save(update_fields=["is_active"])
        return Response(AdminUserSerializer(target).data)


class AdminProjectListView(APIView):
    """GET `/api/admin/projects/` — optional ?status= & ?search=."""

    permission_classes = ADMIN_PERMS

    def get(self, request):
        qs = ResearchProject.objects.select_related("owner").order_by("-created_at")
        status_filter = (request.query_params.get("status") or "").strip().upper()
        if status_filter:
            if status_filter not in ProjectStatus.values:
                return invalid_choice_response("status", ProjectStatus.values)
            qs = qs.filter(status=status_filter)
        search = query_search(request)
        if search:
            qs = qs.filter(
                Q(title__icontains=search) | Q(owner__email__icontains=search)
            )
        return Response(AdminProjectListSerializer(qs, many=True).data)


class AdminProjectDetailView(APIView):
    """GET/DELETE `/api/admin/projects/{id}/` — detail or permanent remove."""

    permission_classes = ADMIN_PERMS

    def get(self, request, project_id: int):
        qs = (
            ResearchProject.objects.select_related("owner", "proposal")
            .prefetch_related(
                Prefetch(
                    "memberships",
                    queryset=ProjectMembership.objects.select_related("user"),
                ),
                Prefetch(
                    "experiments",
                    queryset=Experiment.objects.select_related(
                        "instrument__installation"
                    ),
                ),
                "publications",
                Prefetch(
                    "invitations",
                    queryset=Invitation.objects.select_related("invited_by"),
                ),
            )
            .annotate(
                member_count=Count("memberships", distinct=True),
                experiment_count=Count("experiments", distinct=True),
                publication_count=Count("publications", distinct=True),
                pending_invitation_count=Count(
                    "invitations",
                    filter=Q(invitations__status=InvitationStatus.PENDING),
                    distinct=True,
                ),
            )
        )
        project = get_object_or_404(qs, pk=project_id)
        return Response(AdminProjectDetailSerializer(project).data)

    def delete(self, request, project_id: int):
        project = get_object_or_404(ResearchProject, pk=project_id)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminProposalListView(APIView):
    """GET `/api/admin/proposals/` — optional ?status=, ?queue=, ?search=."""

    permission_classes = ADMIN_PERMS

    def get(self, request):
        status_filter = (request.query_params.get("status") or "").strip().upper()
        queue = (request.query_params.get("queue") or "").strip().lower()
        qs = Proposal.objects.select_related("project").order_by(
            "submitted_at", "id"
        )
        if queue == "review" or status_filter == "PENDING":
            # Awaiting scientific review only — never draft projects.
            qs = qs.filter(
                status=ProposalStatus.PENDING,
                project__status=ProjectStatus.UNDER_REVIEW,
            )
        elif queue == "draft" or status_filter == "DRAFT":
            qs = qs.filter(project__status=ProjectStatus.DRAFT)
        elif status_filter:
            if status_filter not in ProposalStatus.values:
                return Response(
                    {
                        "detail": (
                            f"Invalid status. Use one of: DRAFT, "
                            f"{', '.join(ProposalStatus.values)}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            qs = qs.filter(status=status_filter)
        search = query_search(request)
        if search:
            qs = qs.filter(project__title__icontains=search)
        return Response(AdminProposalSerializer(qs, many=True).data)


class AdminExperimentListView(APIView):
    """GET `/api/admin/experiments/`."""

    permission_classes = ADMIN_PERMS

    def get(self, request):
        qs = Experiment.objects.select_related(
            "project", "instrument", "instrument__installation"
        ).order_by(
            "scheduled_date", "id"
        )
        return Response(AdminExperimentSerializer(qs, many=True).data)


class AdminPublicationListView(APIView):
    """GET `/api/admin/publications/` — optional ?search= & ?kind=."""

    permission_classes = ADMIN_PERMS

    def get(self, request):
        qs = Publication.objects.select_related("project").order_by(
            "-publication_date", "title"
        )
        kind = (request.query_params.get("kind") or "").strip().upper()
        if kind:
            if kind not in PublicationKind.values:
                return invalid_choice_response("kind", PublicationKind.values)
            qs = qs.filter(kind=kind)
        search = query_search(request)
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(authors__icontains=search)
                | Q(doi__icontains=search)
                | Q(journal__icontains=search)
            )
        return Response(AdminPublicationSerializer(qs, many=True).data)


class AdminInvitationListView(APIView):
    """GET `/api/admin/invitations/` — optional ?status=, ?search=, ?project=."""

    permission_classes = ADMIN_PERMS

    def get(self, request):
        qs = Invitation.objects.select_related("project", "invited_by").order_by(
            "-created_at"
        )
        status_filter = (request.query_params.get("status") or "").strip().upper()
        if status_filter:
            if status_filter not in InvitationStatus.values:
                return invalid_choice_response("status", InvitationStatus.values)
            qs = qs.filter(status=status_filter)
        search = query_search(request)
        if search:
            qs = qs.filter(email__icontains=search)
        project_id = (request.query_params.get("project") or "").strip()
        if project_id:
            if not project_id.isdigit():
                return Response(
                    {"detail": "Invalid project. Use a numeric project id."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            qs = qs.filter(project_id=int(project_id))
        return Response(AdminInvitationSerializer(qs, many=True).data)


class AdminInvitationCancelView(APIView):
    """DELETE `/api/admin/invitations/{id}/` — cancel pending only."""

    permission_classes = ADMIN_PERMS

    def delete(self, request, invitation_id: int):
        invitation = get_object_or_404(Invitation, pk=invitation_id)
        try:
            cancel_invitation(invitation)
        except InvitationError as exc:
            return api_error(exc.detail)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminStatsView(APIView):
    """GET `/api/admin/stats/` — platform ADMIN from admin-ui origin only."""

    permission_classes = ADMIN_PERMS

    def get(self, request):
        data = {
            "total_projects": ResearchProject.objects.exclude(
                status=ProjectStatus.SOFT_DELETED
            ).count(),
            "pending_proposals": Proposal.objects.filter(
                status=ProposalStatus.PENDING,
                project__status=ProjectStatus.UNDER_REVIEW,
            ).count(),
            "scheduled_experiments": Experiment.objects.filter(
                status=ExperimentStatus.SCHEDULED
            ).count(),
            "completed_projects": ResearchProject.objects.filter(
                status=ProjectStatus.COMPLETED
            ).count(),
            "researchers": User.objects.filter(role=GlobalRole.RESEARCHER).count(),
            "pending_invitations": Invitation.objects.filter(
                status=InvitationStatus.PENDING
            ).count(),
            "publications": Publication.objects.count(),
        }
        return Response(data)
