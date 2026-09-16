"""DRF permission classes for project-scoped AuthZ."""

from urllib.parse import urlparse

from django.conf import settings
from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import MembershipRole, ResearchProject
from .selectors import is_platform_admin, user_project_role


def _project_from_obj(obj) -> ResearchProject | None:
    """Normalize view object to a ResearchProject (project itself or nested)."""
    if obj is None:
        return None
    if isinstance(obj, ResearchProject):
        return obj
    return getattr(obj, "project", None)


def _request_origin(request) -> str | None:
    """Browser Origin, or scheme+netloc from Referer as fallback."""
    origin = request.headers.get("Origin")
    if origin:
        return origin.rstrip("/")
    referer = request.headers.get("Referer")
    if not referer:
        return None
    parsed = urlparse(referer)
    if not parsed.scheme or not parsed.netloc:
        return None
    return f"{parsed.scheme}://{parsed.netloc}"


class IsAdminUiOrigin(BasePermission):
    """
    Require Origin (or Referer) to match ADMIN_UI_ORIGINS when that list is set.
    Does not replace IsPlatformAdmin — stack both on admin routes.
    """

    message = "Admin API calls must come from the admin UI origin."

    def has_permission(self, request, view) -> bool:
        allowed = [o.rstrip("/") for o in getattr(settings, "ADMIN_UI_ORIGINS", [])]
        if not allowed:
            return True
        origin = _request_origin(request)
        if origin is None:
            return False
        return origin in allowed


class IsPlatformAdmin(BasePermission):
    """GlobalRole.SUPER_ADMIN, ADMIN, or is_staff."""

    def has_permission(self, request, view) -> bool:
        return is_platform_admin(request.user)


class IsSuperAdmin(BasePermission):
    """GlobalRole.SUPER_ADMIN only (e.g. create admin accounts)."""

    message = "Only a super admin can perform this action."

    def has_permission(self, request, view) -> bool:
        from .selectors import is_super_admin

        return is_super_admin(request.user)


class IsProjectMember(BasePermission):
    """Owner, any membership role, or platform admin. Object-level."""

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        if is_platform_admin(request.user):
            return True
        project = _project_from_obj(obj)
        if project is None:
            return False
        return user_project_role(request.user, project) is not None


class IsProjectEditor(BasePermission):
    """OWNER or EDITOR membership, or platform admin. Object-level."""

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        if is_platform_admin(request.user):
            return True
        project = _project_from_obj(obj)
        if project is None:
            return False
        role = user_project_role(request.user, project)
        return role in (MembershipRole.OWNER, MembershipRole.EDITOR)


class IsProjectOwnerOrAdmin(BasePermission):
    """Project OWNER or platform admin. Object-level."""

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        if is_platform_admin(request.user):
            return True
        project = _project_from_obj(obj)
        if project is None:
            return False
        return user_project_role(request.user, project) == MembershipRole.OWNER


class IsProjectMemberReadEditorWrite(BasePermission):
    """SAFE methods: member+; writes: editor+ (or admin)."""

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        if is_platform_admin(request.user):
            return True
        project = _project_from_obj(obj)
        if project is None:
            return False
        role = user_project_role(request.user, project)
        if role is None:
            return False
        if request.method in SAFE_METHODS:
            return True
        return role in (MembershipRole.OWNER, MembershipRole.EDITOR)
