"""Query-param helpers for admin list endpoints.

Used by admin_api list views to parse `search` / boolean filters and apply
consistent queryset narrowing without duplicating parsing in each app.
"""

from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response


def query_search(request) -> str:
    """Return trimmed `?search=` or empty string."""
    return (request.query_params.get("search") or "").strip()


def query_bool(request, name: str):
    """Parse optional boolean query param.

    Returns True/False, None when absent, or the string ``"invalid"`` when
    the value is not a recognized boolean (caller should return 400).
    """
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
    """400 response listing allowed choice values for a query/body field."""
    return Response(
        {"detail": f"Invalid {field}. Use one of: {', '.join(allowed)}."},
        status=status.HTTP_400_BAD_REQUEST,
    )


def apply_user_search(qs, search: str):
    """Filter users by email or username substring (case-insensitive)."""
    if not search:
        return qs
    return qs.filter(
        Q(email__icontains=search) | Q(username__icontains=search)
    )


def apply_is_active(qs, is_active):
    """Optionally filter by ``is_active``; no-op when ``is_active`` is None."""
    if is_active is None:
        return qs
    return qs.filter(is_active=is_active)
