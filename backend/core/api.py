"""Shared DRF helpers for admin routes and detail error responses."""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsAdminUiOrigin, IsPlatformAdmin, IsSuperAdmin

ADMIN_PERMS = [IsAuthenticated, IsAdminUiOrigin, IsPlatformAdmin]
SUPER_ADMIN_PERMS = [IsAuthenticated, IsAdminUiOrigin, IsSuperAdmin]


def api_error(detail: str, status_code: int = status.HTTP_400_BAD_REQUEST) -> Response:
    """Uniform `{"detail": ...}` error body used across ResearchHub APIs."""
    return Response({"detail": detail}, status=status_code)
