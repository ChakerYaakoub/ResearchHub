"""Invitation REST endpoints (thin views; logic in services)."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.permissions import IsProjectOwnerOrAdmin
from projects.selectors import get_visible_project

from .models import Invitation
from .serializers import (
    InvitationCreateSerializer,
    InvitationCreatedSerializer,
    InvitationListSerializer,
)
from .services import (
    InvitationError,
    accept_invitation,
    cancel_invitation,
    create_project_invitation,
    decline_invitation,
)


def _invitation_error(exc: InvitationError) -> Response:
    return Response({"detail": exc.detail}, status=status.HTTP_400_BAD_REQUEST)


class ProjectInvitationListCreateView(APIView):
    """GET/POST `/api/projects/{id}/invitations/` — owner/admin."""

    permission_classes = [IsAuthenticated, IsProjectOwnerOrAdmin]

    def get(self, request, project_pk: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        qs = project.invitations.select_related("invited_by", "project").all()
        return Response(InvitationListSerializer(qs, many=True).data)

    def post(self, request, project_pk: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        serializer = InvitationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            invitation = create_project_invitation(
                project=project,
                invited_by=request.user,
                email=serializer.validated_data["email"],
                role=serializer.validated_data["role"],
            )
        except InvitationError as exc:
            return _invitation_error(exc)
        return Response(
            InvitationCreatedSerializer(invitation).data,
            status=status.HTTP_201_CREATED,
        )


class ProjectInvitationCancelView(APIView):
    """DELETE `/api/projects/{id}/invitations/{invitation_id}/` — owner/admin."""

    permission_classes = [IsAuthenticated, IsProjectOwnerOrAdmin]

    def delete(self, request, project_pk: int, invitation_id: int):
        project = get_visible_project(request.user, project_pk)
        self.check_object_permissions(request, project)
        invitation = get_object_or_404(Invitation, pk=invitation_id, project=project)
        try:
            cancel_invitation(invitation)
        except InvitationError as exc:
            return _invitation_error(exc)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyInvitationListView(APIView):
    """GET `/api/invitations/` — invites for the authenticated user's email."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        email = request.user.email.lower().strip()
        qs = (
            Invitation.objects.filter(email__iexact=email)
            .select_related("project", "invited_by")
            .all()
        )
        return Response(InvitationListSerializer(qs, many=True).data)


class InvitationAcceptView(APIView):
    """POST `/api/invitations/{token}/accept/`."""

    permission_classes = [IsAuthenticated]

    def post(self, request, token: str):
        try:
            invitation = accept_invitation(token, request.user)
        except InvitationError as exc:
            return _invitation_error(exc)
        return Response(InvitationListSerializer(invitation).data)


class InvitationDeclineView(APIView):
    """POST `/api/invitations/{token}/decline/`."""

    permission_classes = [IsAuthenticated]

    def post(self, request, token: str):
        try:
            invitation = decline_invitation(token, request.user)
        except InvitationError as exc:
            return _invitation_error(exc)
        return Response(InvitationListSerializer(invitation).data)
