"""Admin and researcher endpoints for installations / instruments."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.permissions import IsAdminUiOrigin, IsPlatformAdmin

from .models import Installation, InstallationStatus, Instrument, InstrumentStatus
from .serializers import InstallationSerializer, InstrumentSerializer

_ADMIN_PERMS = [IsAuthenticated, IsAdminUiOrigin, IsPlatformAdmin]


# --- Researcher read (authenticated; active/available only) ---


class InstallationListView(APIView):
    """GET `/api/installations/` — ACTIVE installations for experiment pickers."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Installation.objects.filter(status=InstallationStatus.ACTIVE)
        return Response(InstallationSerializer(qs, many=True).data)


class InstrumentListView(APIView):
    """GET `/api/instruments/` — AVAILABLE instruments; optional `?installation=`."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Instrument.objects.filter(
            status=InstrumentStatus.AVAILABLE,
            installation__status=InstallationStatus.ACTIVE,
        ).select_related("installation")
        installation_id = request.query_params.get("installation")
        if installation_id:
            qs = qs.filter(installation_id=installation_id)
        return Response(InstrumentSerializer(qs, many=True).data)


# --- Admin CRUD ---


class AdminInstallationListCreateView(APIView):
    """GET/POST `/api/admin/installations/`."""

    permission_classes = _ADMIN_PERMS

    def get(self, request):
        qs = Installation.objects.all()
        return Response(InstallationSerializer(qs, many=True).data)

    def post(self, request):
        ser = InstallationSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)


class AdminInstallationDetailView(APIView):
    """GET/PATCH/DELETE `/api/admin/installations/{id}/`."""

    permission_classes = _ADMIN_PERMS

    def get(self, request, pk: int):
        obj = get_object_or_404(Installation, pk=pk)
        return Response(InstallationSerializer(obj).data)

    def patch(self, request, pk: int):
        obj = get_object_or_404(Installation, pk=pk)
        ser = InstallationSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, pk: int):
        obj = get_object_or_404(Installation, pk=pk)
        if obj.instruments.exists():
            return Response(
                {
                    "detail": "Cannot delete an installation that still has instruments."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminInstrumentListCreateView(APIView):
    """GET/POST `/api/admin/instruments/` — optional `?installation=` on GET."""

    permission_classes = _ADMIN_PERMS

    def get(self, request):
        qs = Instrument.objects.select_related("installation").all()
        installation_id = request.query_params.get("installation")
        if installation_id:
            qs = qs.filter(installation_id=installation_id)
        return Response(InstrumentSerializer(qs, many=True).data)

    def post(self, request):
        ser = InstrumentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)


class AdminInstrumentDetailView(APIView):
    """GET/PATCH/DELETE `/api/admin/instruments/{id}/`."""

    permission_classes = _ADMIN_PERMS

    def get(self, request, pk: int):
        obj = get_object_or_404(Instrument.objects.select_related("installation"), pk=pk)
        return Response(InstrumentSerializer(obj).data)

    def patch(self, request, pk: int):
        obj = get_object_or_404(Instrument, pk=pk)
        ser = InstrumentSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, pk: int):
        obj = get_object_or_404(Instrument, pk=pk)
        if obj.experiments.exists():
            return Response(
                {
                    "detail": "Cannot delete an instrument that is used by experiments."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
