"""Publication REST endpoints nested under projects + detail by id."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import ResearchProject

from .models import Publication
from .serializers import PublicationSerializer


def _owned_project(user, project_pk: int) -> ResearchProject:
    return get_object_or_404(ResearchProject, pk=project_pk, owner=user)


def _owned_publication(user, pk: int) -> Publication:
    return get_object_or_404(
        Publication.objects.select_related("project"),
        pk=pk,
        project__owner=user,
    )


class ProjectPublicationListCreateView(APIView):
    """GET/POST `/api/projects/{id}/publications/`."""

    def get(self, request, project_pk: int):
        project = _owned_project(request.user, project_pk)
        qs = project.publications.all()
        return Response(PublicationSerializer(qs, many=True).data)

    def post(self, request, project_pk: int):
        project = _owned_project(request.user, project_pk)
        serializer = PublicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        publication = serializer.save(project=project)
        return Response(PublicationSerializer(publication).data, status=status.HTTP_201_CREATED)


class PublicationDetailView(APIView):
    """GET/PUT/PATCH/DELETE `/api/publications/{id}/`."""

    def get(self, request, pk: int):
        publication = _owned_publication(request.user, pk)
        return Response(PublicationSerializer(publication).data)

    def put(self, request, pk: int):
        publication = _owned_publication(request.user, pk)
        serializer = PublicationSerializer(publication, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk: int):
        publication = _owned_publication(request.user, pk)
        serializer = PublicationSerializer(publication, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk: int):
        publication = _owned_publication(request.user, pk)
        publication.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
