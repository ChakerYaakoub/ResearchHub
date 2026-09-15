"""Experiment REST endpoints nested under projects + detail by id."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import ResearchProject

from .models import Experiment
from .serializers import ExperimentSerializer


def _owned_project(user, project_pk: int) -> ResearchProject:
    return get_object_or_404(ResearchProject, pk=project_pk, owner=user)


def _owned_experiment(user, pk: int) -> Experiment:
    return get_object_or_404(Experiment.objects.select_related("project"), pk=pk, project__owner=user)


class ProjectExperimentListCreateView(APIView):
    """GET/POST `/api/projects/{id}/experiments/`."""

    def get(self, request, project_pk: int):
        project = _owned_project(request.user, project_pk)
        qs = project.experiments.all()
        return Response(ExperimentSerializer(qs, many=True).data)

    def post(self, request, project_pk: int):
        project = _owned_project(request.user, project_pk)
        serializer = ExperimentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        experiment = serializer.save(project=project)
        return Response(ExperimentSerializer(experiment).data, status=status.HTTP_201_CREATED)


class ExperimentDetailView(APIView):
    """GET/PUT/PATCH/DELETE `/api/experiments/{id}/`."""

    def get(self, request, pk: int):
        experiment = _owned_experiment(request.user, pk)
        return Response(ExperimentSerializer(experiment).data)

    def put(self, request, pk: int):
        experiment = _owned_experiment(request.user, pk)
        serializer = ExperimentSerializer(experiment, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk: int):
        experiment = _owned_experiment(request.user, pk)
        serializer = ExperimentSerializer(experiment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk: int):
        experiment = _owned_experiment(request.user, pk)
        experiment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
