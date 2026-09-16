"""Query-param helpers for admin list endpoints."""

from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response


def query_search(request) -> str:
    return (request.query_params.get("search") or "").strip()


def query_bool(request, name: str):
    """Return True/False/None for optional boolean query params."""
    raw = request.query_params.get(name)
    if raw is None or raw == "":
        return None
    value = str(raw).strip().lower()
    if value in ("1", "true", "yes"):
        return True
    if value in ("0", "false", "no"):
        return False
    return "invalid"


def invalid_choice_response(field: str, allowed) -> Response:
    return Response(
        {"detail": f"Invalid {field}. Use one of: {', '.join(allowed)}."},
        status=status.HTTP_400_BAD_REQUEST,
    )


def apply_user_search(qs, search: str):
    if not search:
        return qs
    return qs.filter(
        Q(email__icontains=search) | Q(username__icontains=search)
    )


def apply_is_active(qs, is_active):
    if is_active is None:
        return qs
    return qs.filter(is_active=is_active)
