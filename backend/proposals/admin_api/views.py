"""Admin-panel proposal list views (admin-ui Origin + platform ADMIN)."""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.admin_filters import query_search
from core.api import ADMIN_PERMS
from projects.models import ProjectStatus
from proposals.admin_api.serializers import AdminProposalSerializer
from proposals.models import Proposal, ProposalStatus


class AdminProposalListView(APIView):
    """GET `/api/admin/proposals/` — optional ?status=, ?queue=, ?search=."""

    permission_classes = ADMIN_PERMS

    def get(self, request):
        status_filter = (request.query_params.get("status") or "").strip().upper()
        queue = (request.query_params.get("queue") or "").strip().lower()
        qs = Proposal.objects.select_related("project").order_by(
            "submitted_at", "id"
        )
        if queue == "review" or status_filter == "PENDING":
            # Awaiting scientific review only — never draft projects.
            qs = qs.filter(
                status=ProposalStatus.PENDING,
                project__status=ProjectStatus.UNDER_REVIEW,
            )
        elif queue == "draft" or status_filter == "DRAFT":
            qs = qs.filter(project__status=ProjectStatus.DRAFT)
        elif status_filter:
            if status_filter not in ProposalStatus.values:
                return Response(
                    {
                        "detail": (
                            f"Invalid status. Use one of: DRAFT, "
                            f"{', '.join(ProposalStatus.values)}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            qs = qs.filter(status=status_filter)
        search = query_search(request)
        if search:
            qs = qs.filter(project__title__icontains=search)
        return Response(AdminProposalSerializer(qs, many=True).data)
