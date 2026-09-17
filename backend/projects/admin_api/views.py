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
from publications.models import Publication
from users.models import GlobalRole, User

from core.admin_filters import invalid_choice_response, query_search
from core.api import ADMIN_PERMS, api_error
from projects.models import ProjectMembership, ProjectStatus, ResearchProject

from .serializers import (
    AdminInvitationSerializer,
    AdminProjectDetailSerializer,
    AdminProjectListSerializer,
)


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
