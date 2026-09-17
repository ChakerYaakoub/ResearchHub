"""Admin-panel experiment list views (admin-ui Origin + platform ADMIN)."""

from rest_framework.response import Response
from rest_framework.views import APIView

from core.api import ADMIN_PERMS
from experiments.admin_api.serializers import AdminExperimentSerializer
from experiments.models import Experiment


class AdminExperimentListView(APIView):
    """GET `/api/admin/experiments/`."""

    permission_classes = ADMIN_PERMS

    def get(self, request):
        qs = Experiment.objects.select_related(
            "project", "instrument", "instrument__installation"
        ).order_by(
            "scheduled_date", "id"
        )
        return Response(AdminExperimentSerializer(qs, many=True).data)
