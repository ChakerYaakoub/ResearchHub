"""Project REST viewsets (soft ownership filter until Phase 5)."""

from rest_framework import viewsets

from .models import MembershipRole, ProjectMembership, ResearchProject
from .serializers import ResearchProjectSerializer


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
