"""Admin-panel invitation list/manage views (admin-ui Origin + platform ADMIN)."""
import uuid

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.admin_filters import invalid_choice_response, query_search
from core.api import ADMIN_PERMS, api_error
from invitations.admin_api.serializers import AdminInvitationSerializer
from invitations.models import Invitation, InvitationStatus
from invitations.services import InvitationError, cancel_invitation


class AdminInvitationListView(APIView):
    """GET `/api/admin/invitations/` — optional ?status=, ?search=, ?project=."""

    permission_classes = ADMIN_PERMS

    def get(self, request):
        qs = Invitation.objects.select_related("project", "invited_by").order_by(
            "-created_at"
        )
        status_filter = (request.query_params.get("status") or "").strip().upper()
        if status_filter:
            if status_filter not in InvitationStatus.values:
                return invalid_choice_response("status", InvitationStatus.values)
            qs = qs.filter(status=status_filter)
        search = query_search(request)
        if search:
            qs = qs.filter(email__icontains=search)
        project_id = (request.query_params.get("project") or "").strip()
        if project_id:
            try:
                uuid.UUID(project_id)
            except ValueError:
                return Response(
                    {"detail": "Invalid project. Use a UUID project id."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            qs = qs.filter(project_id=project_id)
        return Response(AdminInvitationSerializer(qs, many=True).data)


class AdminInvitationCancelView(APIView):
    """DELETE `/api/admin/invitations/{id}/` — cancel pending only."""

    permission_classes = ADMIN_PERMS

    def delete(self, request, invitation_id: uuid.UUID):
        invitation = get_object_or_404(Invitation, pk=invitation_id)
        try:
            cancel_invitation(invitation)
        except InvitationError as exc:
            return api_error(exc.detail)
        return Response(status=status.HTTP_204_NO_CONTENT)
