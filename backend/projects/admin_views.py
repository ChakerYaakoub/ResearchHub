"""Admin-panel list/manage views (admin-ui Origin + platform ADMIN)."""

from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from experiments.models import Experiment
from invitations.models import Invitation, InvitationStatus
from invitations.services import InvitationError, cancel_invitation
from proposals.models import Proposal, ProposalStatus
from publications.models import Publication
from users.models import User

from .admin_serializers import (
    AdminExperimentSerializer,
    AdminInvitationSerializer,
    AdminProjectDetailSerializer,
    AdminProjectListSerializer,
    AdminProposalSerializer,
    AdminPublicationSerializer,
    AdminUserPatchSerializer,
    AdminUserSerializer,
)
from .models import ResearchProject
from .permissions import IsAdminUiOrigin, IsPlatformAdmin

_ADMIN_PERMS = [IsAuthenticated, IsAdminUiOrigin, IsPlatformAdmin]


class AdminUserListView(APIView):
    """GET `/api/admin/users/`."""

    permission_classes = _ADMIN_PERMS

    def get(self, request):
        qs = User.objects.order_by("email")
        return Response(AdminUserSerializer(qs, many=True).data)


class AdminUserDetailView(APIView):
    """PATCH `/api/admin/users/{id}/` — role / is_active (not self)."""

    permission_classes = _ADMIN_PERMS

    def patch(self, request, user_id: int):
        target = get_object_or_404(User, pk=user_id)
        if target.pk == request.user.pk:
            return Response(
                {"detail": "You cannot change your own role or active status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ser = AdminUserPatchSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        if "role" in data:
            target.role = data["role"]
        if "is_active" in data:
            target.is_active = data["is_active"]
        target.save()
        return Response(AdminUserSerializer(target).data)


class AdminProjectListView(APIView):
    """GET `/api/admin/projects/`."""

    permission_classes = _ADMIN_PERMS

    def get(self, request):
        qs = ResearchProject.objects.select_related("owner").order_by("-created_at")
        return Response(AdminProjectListSerializer(qs, many=True).data)


class AdminProjectDetailView(APIView):
    """GET `/api/admin/projects/{id}/`."""

    permission_classes = _ADMIN_PERMS

    def get(self, request, project_id: int):
        qs = (
            ResearchProject.objects.select_related("owner", "proposal")
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


class AdminProposalListView(APIView):
    """GET `/api/admin/proposals/` — default pending+under review; optional ?status=."""

    permission_classes = _ADMIN_PERMS

    def get(self, request):
        status_filter = (request.query_params.get("status") or "").strip().upper()
        qs = Proposal.objects.select_related("project").order_by(
            "submitted_at", "id"
        )
        if status_filter:
            if status_filter not in ProposalStatus.values:
                return Response(
                    {"detail": f"Invalid status. Use one of: {', '.join(ProposalStatus.values)}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            qs = qs.filter(status=status_filter)
        else:
            # Review queue default (same as Phase 12).
            from projects.models import ProjectStatus

            qs = qs.filter(
                status=ProposalStatus.PENDING,
                project__status=ProjectStatus.UNDER_REVIEW,
            )
        return Response(AdminProposalSerializer(qs, many=True).data)


class AdminExperimentListView(APIView):
    """GET `/api/admin/experiments/`."""

    permission_classes = _ADMIN_PERMS

    def get(self, request):
        qs = Experiment.objects.select_related("project").order_by(
            "scheduled_date", "id"
        )
        return Response(AdminExperimentSerializer(qs, many=True).data)


class AdminPublicationListView(APIView):
    """GET `/api/admin/publications/`."""

    permission_classes = _ADMIN_PERMS

    def get(self, request):
        qs = Publication.objects.select_related("project").order_by(
            "-publication_date", "title"
        )
        return Response(AdminPublicationSerializer(qs, many=True).data)


class AdminInvitationListView(APIView):
    """GET `/api/admin/invitations/`."""

    permission_classes = _ADMIN_PERMS

    def get(self, request):
        qs = Invitation.objects.select_related("project", "invited_by").order_by(
            "-created_at"
        )
        return Response(AdminInvitationSerializer(qs, many=True).data)


class AdminInvitationCancelView(APIView):
    """DELETE `/api/admin/invitations/{id}/` — cancel pending only."""

    permission_classes = _ADMIN_PERMS

    def delete(self, request, invitation_id: int):
        invitation = get_object_or_404(Invitation, pk=invitation_id)
        try:
            cancel_invitation(invitation)
        except InvitationError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
