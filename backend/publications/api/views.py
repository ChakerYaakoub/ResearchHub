"""Publication REST endpoints nested under projects + detail by id."""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.api import api_error
from core.permissions import IsProjectMemberReadEditorWrite
from projects.selectors import get_visible_project, get_visible_publication
from projects.services import WorkflowError, assert_can_mutate_publications
from publications.api.serializers import PublicationSerializer
from publications.models import PublicationKind


class ProjectPublicationListCreateView(APIView):
    """GET/POST `/api/projects/{id}/publications/` — member read; editor write."""

    permission_classes = [IsAuthenticated, IsProjectMemberReadEditorWrite]

    def get(self, request, project_pk: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        qs = project.publications.all()
        return Response(PublicationSerializer(qs, many=True).data)

    def post(self, request, project_pk: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        serializer = PublicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        kind = serializer.validated_data.get("kind", PublicationKind.EXISTING)
        try:
            assert_can_mutate_publications(project, kind)
        except WorkflowError as exc:
            return api_error(exc.detail)
        publication = serializer.save(project=project)
        return Response(PublicationSerializer(publication).data, status=status.HTTP_201_CREATED)


class PublicationDetailView(APIView):
    """GET/PUT/PATCH/DELETE `/api/publications/{id}/` — member read; editor write."""

    permission_classes = [IsAuthenticated, IsProjectMemberReadEditorWrite]

    def get(self, request, pk: int):
        publication = get_visible_publication(request.user, pk)
        self.check_object_permissions(request, publication)
        return Response(PublicationSerializer(publication).data)

    def put(self, request, pk: int):
        publication = get_visible_publication(request.user, pk)
        self.check_object_permissions(request, publication)
        serializer = PublicationSerializer(publication, data=request.data)
        serializer.is_valid(raise_exception=True)
        kind = serializer.validated_data.get("kind", publication.kind)
        try:
            assert_can_mutate_publications(publication.project, kind)
        except WorkflowError as exc:
            return api_error(exc.detail)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk: int):
        publication = get_visible_publication(request.user, pk)
        self.check_object_permissions(request, publication)
        serializer = PublicationSerializer(publication, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        kind = serializer.validated_data.get("kind", publication.kind)
        try:
            assert_can_mutate_publications(publication.project, kind)
        except WorkflowError as exc:
            return api_error(exc.detail)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk: int):
        publication = get_visible_publication(request.user, pk)
        self.check_object_permissions(request, publication)
        try:
            assert_can_mutate_publications(publication.project, publication.kind)
        except WorkflowError as exc:
            return api_error(exc.detail)
        publication.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
