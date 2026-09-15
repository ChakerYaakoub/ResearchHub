"""DRF permission classes for project-scoped AuthZ."""

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


class IsPlatformAdmin(BasePermission):
    """GlobalRole.ADMIN or is_staff."""

    def has_permission(self, request, view) -> bool:
        return is_platform_admin(request.user)


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
