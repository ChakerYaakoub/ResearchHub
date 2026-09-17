"""Admin and researcher endpoints for installations / instruments."""
import uuid

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.admin_filters import invalid_choice_response, query_search
from core.api import ADMIN_PERMS

from .models import Installation, InstallationStatus, Instrument, InstrumentStatus
from .serializers import InstallationSerializer, InstrumentSerializer


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
    """GET/POST `/api/admin/installations/` — optional ?status= & ?search=."""

    permission_classes = ADMIN_PERMS

    def get(self, request):
        qs = Installation.objects.all()
        status_filter = (request.query_params.get("status") or "").strip().upper()
        if status_filter:
            if status_filter not in InstallationStatus.values:
                return invalid_choice_response("status", InstallationStatus.values)
            qs = qs.filter(status=status_filter)
        search = query_search(request)
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(location__icontains=search)
            )
        return Response(InstallationSerializer(qs, many=True).data)

    def post(self, request):
        ser = InstallationSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)


class AdminInstallationDetailView(APIView):
    """GET/PATCH/DELETE `/api/admin/installations/{id}/`."""

    permission_classes = ADMIN_PERMS

    def get(self, request, pk: uuid.UUID):
        obj = get_object_or_404(Installation, pk=pk)
        return Response(InstallationSerializer(obj).data)

    def patch(self, request, pk: uuid.UUID):
        obj = get_object_or_404(Installation, pk=pk)
        ser = InstallationSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, pk: uuid.UUID):
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
    """GET/POST `/api/admin/instruments/` — ?installation=, ?status=, ?search=."""

    permission_classes = ADMIN_PERMS

    def get(self, request):
        qs = Instrument.objects.select_related("installation").all()
        installation_id = request.query_params.get("installation")
        if installation_id:
            qs = qs.filter(installation_id=installation_id)
        status_filter = (request.query_params.get("status") or "").strip().upper()
        if status_filter:
            if status_filter not in InstrumentStatus.values:
                return invalid_choice_response("status", InstrumentStatus.values)
            qs = qs.filter(status=status_filter)
        search = query_search(request)
        if search:
            qs = qs.filter(
                Q(code__icontains=search)
                | Q(name__icontains=search)
                | Q(technique__icontains=search)
            )
        return Response(InstrumentSerializer(qs, many=True).data)

    def post(self, request):
        ser = InstrumentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)


class AdminInstrumentDetailView(APIView):
    """GET/PATCH/DELETE `/api/admin/instruments/{id}/`."""

    permission_classes = ADMIN_PERMS

    def get(self, request, pk: uuid.UUID):
        obj = get_object_or_404(Instrument.objects.select_related("installation"), pk=pk)
        return Response(InstrumentSerializer(obj).data)

    def patch(self, request, pk: uuid.UUID):
        obj = get_object_or_404(Instrument, pk=pk)
        ser = InstrumentSerializer(obj, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    def delete(self, request, pk: uuid.UUID):
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
