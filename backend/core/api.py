"""Shared DRF helpers for admin routes and detail error responses.

Permission stacks encode the dual admin gate: JWT platform role + admin-ui Origin.
Views should reuse these lists rather than redefining Origin/role checks.
"""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsAdminUiOrigin, IsPlatformAdmin, IsSuperAdmin

# Standard admin-ui routes: authenticated platform ADMIN/SUPER_ADMIN + Origin allowlist.
ADMIN_PERMS = [IsAuthenticated, IsAdminUiOrigin, IsPlatformAdmin]
# Stricter: SUPER_ADMIN only (create admins, list admin accounts).
SUPER_ADMIN_PERMS = [IsAuthenticated, IsAdminUiOrigin, IsSuperAdmin]


def api_error(detail: str, status_code: int = status.HTTP_400_BAD_REQUEST) -> Response:
    """Uniform `{"detail": ...}` error body used across ResearchHub APIs."""
    return Response({"detail": detail}, status=status_code)
