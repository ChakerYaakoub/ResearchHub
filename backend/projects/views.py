"""Project REST viewsets and nested collaborator/admin helpers."""

from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from experiments.models import Experiment, ExperimentStatus
from invitations.models import Invitation, InvitationStatus
from proposals.models import Proposal, ProposalStatus
from publications.models import Publication
from users.models import GlobalRole, User

from .models import MembershipRole, ProjectMembership, ProjectStatus, ResearchProject
from .serializers import ProjectMembershipSerializer, ResearchProjectSerializer


class ResearchProjectViewSet(viewsets.ModelViewSet):
    """CRUD for projects owned by the current user (Phase 3 soft scope)."""

    serializer_class = ResearchProjectSerializer
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return ResearchProject.objects.filter(owner=self.request.user).select_related(
            "owner"
        )

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        ProjectMembership.objects.get_or_create(
            project=project,
            user=self.request.user,
            defaults={"role": MembershipRole.OWNER},
        )


class ProjectCollaboratorListView(APIView):
    """GET `/api/projects/{id}/collaborators/`."""

    def get(self, request, project_pk: int):
        project = get_object_or_404(ResearchProject, pk=project_pk, owner=request.user)
        qs = project.memberships.select_related("user").all()
        return Response(ProjectMembershipSerializer(qs, many=True).data)


class ProjectCollaboratorDeleteView(APIView):
    """DELETE `/api/projects/{id}/collaborators/{user_id}/` — cannot remove owner."""

    def delete(self, request, project_pk: int, user_id: int):
        project = get_object_or_404(ResearchProject, pk=project_pk, owner=request.user)
        membership = get_object_or_404(
            ProjectMembership,
            project=project,
            user_id=user_id,
        )
        if membership.role == MembershipRole.OWNER or membership.user_id == project.owner_id:
            return Response(
                {"detail": "Project owner cannot be removed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminStatsView(APIView):
    """GET `/api/admin/stats/` — platform ADMIN role only (soft gate)."""

    def get(self, request):
        if getattr(request.user, "role", None) != GlobalRole.ADMIN and not request.user.is_staff:
            return Response(
                {"detail": "Admin role required."},
                status=status.HTTP_403_FORBIDDEN,
            )
        data = {
            "total_projects": ResearchProject.objects.count(),
            "pending_proposals": Proposal.objects.filter(
                status=ProposalStatus.PENDING
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
