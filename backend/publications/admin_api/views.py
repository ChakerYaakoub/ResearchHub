"""Admin-panel publication list views (admin-ui Origin + platform ADMIN)."""

from django.db.models import Q
from rest_framework.response import Response
from rest_framework.views import APIView

from core.admin_filters import invalid_choice_response, query_search
from core.api import ADMIN_PERMS
from publications.admin_api.serializers import AdminPublicationSerializer
from publications.models import Publication, PublicationKind


class AdminPublicationListView(APIView):
    """GET `/api/admin/publications/` — optional ?search= & ?kind=."""

    permission_classes = ADMIN_PERMS

    def get(self, request):
        qs = Publication.objects.select_related("project").order_by(
            "-publication_date", "title"
        )
        kind = (request.query_params.get("kind") or "").strip().upper()
        if kind:
            if kind not in PublicationKind.values:
                return invalid_choice_response("kind", PublicationKind.values)
            qs = qs.filter(kind=kind)
        search = query_search(request)
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(authors__icontains=search)
                | Q(doi__icontains=search)
                | Q(journal__icontains=search)
            )
        return Response(AdminPublicationSerializer(qs, many=True).data)
