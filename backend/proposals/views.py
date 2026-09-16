"""Proposal REST endpoints — thin views; workflow in services (Phase 6)."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.permissions import (
    IsAdminUiOrigin,
    IsPlatformAdmin,
    IsProjectEditor,
    IsProjectMemberReadEditorWrite,
)
from projects.selectors import get_visible_project
from projects.services import WorkflowError, is_preparing

from .models import Proposal
from .serializers import ProposalReviewSerializer, ProposalSerializer
from .services import approve_proposal, reject_proposal, submit_proposal


def _workflow_error_response(exc: WorkflowError) -> Response:
    return Response({"detail": exc.detail}, status=status.HTTP_400_BAD_REQUEST)


class ProjectProposalView(APIView):
    """GET/POST/PUT `/api/projects/{id}/proposal/` — member read; editor write."""

    permission_classes = [IsAuthenticated, IsProjectMemberReadEditorWrite]

    def get(self, request, project_pk: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        proposal = get_object_or_404(Proposal, project=project)
        return Response(ProposalSerializer(proposal).data)

    def post(self, request, project_pk: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        if not is_preparing(project):
            return Response(
                {
                    "detail": (
                        "Proposal can only be created when project is "
                        "DRAFT or REJECTED."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if hasattr(project, "proposal"):
            return Response(
                {"detail": "Proposal already exists for this project."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ProposalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        proposal = serializer.save(project=project)
        return Response(ProposalSerializer(proposal).data, status=status.HTTP_201_CREATED)

    def put(self, request, project_pk: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        if not is_preparing(project):
            return Response(
                {
                    "detail": (
                        "Proposal can only be edited when project is "
                        "DRAFT or REJECTED."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        proposal = get_object_or_404(Proposal, project=project)
        serializer = ProposalSerializer(proposal, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ProjectProposalSubmitView(APIView):
    """POST `/api/projects/{id}/proposal/submit/` — editor+."""

    permission_classes = [IsAuthenticated, IsProjectEditor]

    def post(self, request, project_pk: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        try:
            proposal = submit_proposal(project)
        except WorkflowError as exc:
            return _workflow_error_response(exc)
        return Response(ProposalSerializer(proposal).data)


class ProposalApproveView(APIView):
    """POST `/api/proposals/{id}/approve/` — platform ADMIN from admin-ui origin."""

    permission_classes = [IsAuthenticated, IsAdminUiOrigin, IsPlatformAdmin]

    def post(self, request, pk: int):
        proposal = get_object_or_404(
            Proposal.objects.select_related("project"),
            pk=pk,
        )
        body = ProposalReviewSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        try:
            proposal = approve_proposal(
                proposal,
                review_comment=body.validated_data.get("review_comment", ""),
            )
        except WorkflowError as exc:
            return _workflow_error_response(exc)
        return Response(ProposalSerializer(proposal).data)


class ProposalRejectView(APIView):
    """POST `/api/proposals/{id}/reject/` — platform ADMIN from admin-ui origin."""

    permission_classes = [IsAuthenticated, IsAdminUiOrigin, IsPlatformAdmin]

    def post(self, request, pk: int):
        proposal = get_object_or_404(
            Proposal.objects.select_related("project"),
            pk=pk,
        )
        body = ProposalReviewSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        try:
            proposal = reject_proposal(
                proposal,
                review_comment=body.validated_data.get("review_comment", ""),
            )
        except WorkflowError as exc:
            return _workflow_error_response(exc)
        return Response(ProposalSerializer(proposal).data)
