"""Project REST viewsets and nested collaborator/admin helpers."""

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from experiments.models import Experiment, ExperimentStatus
from invitations.models import Invitation, InvitationStatus
from proposals.models import Proposal, ProposalStatus
from publications.models import Publication
from users.models import GlobalRole, User

from .models import MembershipRole, ProjectMembership, ProjectStatus, ResearchProject
from core.api import api_error
from core.permissions import (
    IsAdminUiOrigin,
    IsPlatformAdmin,
    IsProjectEditor,
    IsProjectMember,
    IsProjectOwnerOrAdmin,
)
from .selectors import get_visible_project, projects_visible_to
from .serializers import ProjectMembershipSerializer, ResearchProjectSerializer
from .services import WorkflowError, complete_project, soft_delete_project


class ResearchProjectViewSet(viewsets.ModelViewSet):
    """CRUD for projects visible to the user (membership / owner / admin)."""

    serializer_class = ResearchProjectSerializer
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return projects_visible_to(self.request.user)

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated()]
        if self.action in ("update", "partial_update"):
            return [IsAuthenticated(), IsProjectEditor()]
        if self.action == "destroy":
            return [IsAuthenticated(), IsProjectOwnerOrAdmin()]
        # list / retrieve
        return [IsAuthenticated(), IsProjectMember()]

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        ProjectMembership.objects.get_or_create(
            project=project,
            user=self.request.user,
            defaults={"role": MembershipRole.OWNER},
        )

    def destroy(self, request, *args, **kwargs):
        """Owner soft-delete — row kept as SOFT_DELETED; admin hard-deletes separately."""
        project = self.get_object()
        soft_delete_project(project)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectCollaboratorListView(APIView):
    """GET `/api/projects/{id}/collaborators/` — member+."""

    permission_classes = [IsAuthenticated, IsProjectMember]

    def get(self, request, project_pk: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        qs = project.memberships.select_related("user").all()
        return Response(ProjectMembershipSerializer(qs, many=True).data)


class ProjectCollaboratorDeleteView(APIView):
    """DELETE `/api/projects/{id}/collaborators/{user_id}/` — owner/admin; cannot remove owner."""

    permission_classes = [IsAuthenticated, IsProjectOwnerOrAdmin]

    def delete(self, request, project_pk: int, user_id: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        try:
            membership = ProjectMembership.objects.get(project=project, user_id=user_id)
        except ProjectMembership.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if membership.role == MembershipRole.OWNER or membership.user_id == project.owner_id:
            return Response(
                {"detail": "Project owner cannot be removed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectCompleteView(APIView):
    """POST `/api/projects/{id}/complete/` — editor+; IN_PROGRESS → COMPLETED."""

    permission_classes = [IsAuthenticated, IsProjectEditor]

    def post(self, request, project_pk: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        try:
            project = complete_project(project)
        except WorkflowError as exc:
            return api_error(exc.detail)
        return Response(ResearchProjectSerializer(project).data)


class AdminStatsView(APIView):
    """GET `/api/admin/stats/` — platform ADMIN from admin-ui origin only."""

    permission_classes = [IsAuthenticated, IsAdminUiOrigin, IsPlatformAdmin]

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


