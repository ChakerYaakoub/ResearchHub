"""Proposal REST endpoints (thin status updates; Phase 6 hardens transitions)."""

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import ProjectStatus, ResearchProject

from .models import Proposal, ProposalStatus
from .serializers import ProposalReviewSerializer, ProposalSerializer


def _owned_project(user, project_pk: int) -> ResearchProject:
    return get_object_or_404(ResearchProject, pk=project_pk, owner=user)


class ProjectProposalView(APIView):
    """GET/POST/PUT `/api/projects/{id}/proposal/`."""

    def get(self, request, project_pk: int):
        project = _owned_project(request.user, project_pk)
        proposal = get_object_or_404(Proposal, project=project)
        return Response(ProposalSerializer(proposal).data)

    def post(self, request, project_pk: int):
        project = _owned_project(request.user, project_pk)
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
        project = _owned_project(request.user, project_pk)
        proposal = get_object_or_404(Proposal, project=project)
        serializer = ProposalSerializer(proposal, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ProjectProposalSubmitView(APIView):
    """POST `/api/projects/{id}/proposal/submit/` — marks proposal submitted."""

    def post(self, request, project_pk: int):
        project = _owned_project(request.user, project_pk)
        proposal = get_object_or_404(Proposal, project=project)
        proposal.status = ProposalStatus.PENDING
        proposal.submitted_at = timezone.now()
        proposal.save(update_fields=["status", "submitted_at"])
        project.status = ProjectStatus.SUBMITTED
        project.save(update_fields=["status", "updated_at"])
        return Response(ProposalSerializer(proposal).data)


class ProposalApproveView(APIView):
    """POST `/api/proposals/{id}/approve/` — thin review action (Phase 5/6 harden)."""

    def post(self, request, pk: int):
        proposal = get_object_or_404(
            Proposal.objects.select_related("project"),
            pk=pk,
            project__owner=request.user,
        )
        body = ProposalReviewSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        proposal.status = ProposalStatus.APPROVED
        proposal.reviewed_at = timezone.now()
        proposal.review_comment = body.validated_data.get("review_comment", "")
        proposal.save(update_fields=["status", "reviewed_at", "review_comment"])
        project = proposal.project
        project.status = ProjectStatus.APPROVED
        project.save(update_fields=["status", "updated_at"])
        return Response(ProposalSerializer(proposal).data)


class ProposalRejectView(APIView):
    """POST `/api/proposals/{id}/reject/` — thin review action (Phase 5/6 harden)."""

    def post(self, request, pk: int):
        proposal = get_object_or_404(
            Proposal.objects.select_related("project"),
            pk=pk,
            project__owner=request.user,
        )
        body = ProposalReviewSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        proposal.status = ProposalStatus.REJECTED
        proposal.reviewed_at = timezone.now()
        proposal.review_comment = body.validated_data.get("review_comment", "")
        proposal.save(update_fields=["status", "reviewed_at", "review_comment"])
        project = proposal.project
        project.status = ProjectStatus.REJECTED
        project.save(update_fields=["status", "updated_at"])
        return Response(ProposalSerializer(proposal).data)
