"""Experiment REST endpoints nested under projects + detail by id."""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import ProjectStatus
from projects.permissions import IsProjectMemberReadEditorWrite
from projects.selectors import get_visible_experiment, get_visible_project
from projects.services import (
    WorkflowError,
    assert_can_mutate_experiments,
    start_project,
)

from .serializers import ExperimentSerializer


class ProjectExperimentListCreateView(APIView):
    """GET/POST `/api/projects/{id}/experiments/` — member read; editor write."""

    permission_classes = [IsAuthenticated, IsProjectMemberReadEditorWrite]

    def get(self, request, project_pk: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        qs = project.experiments.all()
        return Response(ExperimentSerializer(qs, many=True).data)

    def post(self, request, project_pk: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        try:
            assert_can_mutate_experiments(project)
        except WorkflowError as exc:
            return Response(
                {"detail": exc.detail},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ExperimentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        experiment = serializer.save(project=project)
        # First experiment after approval starts the project.
        if project.status == ProjectStatus.APPROVED:
            try:
                start_project(project)
            except WorkflowError as exc:
                return Response(
                    {"detail": exc.detail},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(ExperimentSerializer(experiment).data, status=status.HTTP_201_CREATED)


class ExperimentDetailView(APIView):
    """GET/PUT/PATCH/DELETE `/api/experiments/{id}/` — member read; editor write."""

    permission_classes = [IsAuthenticated, IsProjectMemberReadEditorWrite]

    def get(self, request, pk: int):
        experiment = get_visible_experiment(request.user, pk)
        self.check_object_permissions(request, experiment)
        return Response(ExperimentSerializer(experiment).data)

    def put(self, request, pk: int):
        experiment = get_visible_experiment(request.user, pk)
        self.check_object_permissions(request, experiment)
        try:
            assert_can_mutate_experiments(experiment.project)
        except WorkflowError as exc:
            return Response(
                {"detail": exc.detail},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ExperimentSerializer(experiment, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk: int):
        experiment = get_visible_experiment(request.user, pk)
        self.check_object_permissions(request, experiment)
        try:
            assert_can_mutate_experiments(experiment.project)
        except WorkflowError as exc:
            return Response(
                {"detail": exc.detail},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ExperimentSerializer(experiment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk: int):
        experiment = get_visible_experiment(request.user, pk)
        self.check_object_permissions(request, experiment)
        try:
            assert_can_mutate_experiments(experiment.project)
        except WorkflowError as exc:
            return Response(
                {"detail": exc.detail},
                status=status.HTTP_400_BAD_REQUEST,
            )
        experiment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
