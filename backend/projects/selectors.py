"""Project visibility and role lookup (AuthZ helpers).

IDOR defense: list/detail always go through ``projects_visible_to`` /
``get_visible_project`` so outsiders never see soft-deleted or non-member rows.
"""
import uuid

from django.db.models import Q, QuerySet
from django.shortcuts import get_object_or_404

from users.models import GlobalRole

from .models import MembershipRole, ProjectMembership, ProjectStatus, ResearchProject


def is_platform_admin(user) -> bool:
    """True for SUPER_ADMIN, ADMIN, or Django staff."""
    if user is None or not getattr(user, "is_authenticated", False):
        return False
    role = getattr(user, "role", None)
    return role in (GlobalRole.SUPER_ADMIN, GlobalRole.ADMIN) or bool(
        getattr(user, "is_staff", False)
    )


def is_super_admin(user) -> bool:
    """True only for GlobalRole.SUPER_ADMIN."""
    if user is None or not getattr(user, "is_authenticated", False):
        return False
    return getattr(user, "role", None) == GlobalRole.SUPER_ADMIN


def projects_visible_to(user) -> QuerySet[ResearchProject]:
    """Projects the user may see: all if admin, else owner ∪ membership (no soft-deleted)."""
    qs = ResearchProject.objects.select_related("owner")
    if is_platform_admin(user):
        return qs.all()
    return (
        qs.filter(Q(owner=user) | Q(memberships__user=user))
        .exclude(status=ProjectStatus.SOFT_DELETED)
        .distinct()
    )


def get_visible_project(user, pk: uuid.UUID) -> ResearchProject:
    """Resolve a project by pk within the user's visible set (404 if not)."""
    return get_object_or_404(projects_visible_to(user), pk=pk)


def user_project_role(user, project: ResearchProject) -> str | None:
    """
    Effective project role: OWNER / EDITOR / VIEWER, or None.

    Platform admins are handled in permissions (full access), not here.
    Treats `project.owner` as OWNER even without a membership row.
    """
    if user is None or not getattr(user, "is_authenticated", False):
        return None
    if project.owner_id == user.id:
        return MembershipRole.OWNER
    membership = (
        ProjectMembership.objects.filter(project=project, user=user)
        .only("role")
        .first()
    )
    return membership.role if membership else None
