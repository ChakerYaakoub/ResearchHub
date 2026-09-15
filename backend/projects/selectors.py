"""Project visibility and role lookup (AuthZ helpers)."""

from django.db.models import Q, QuerySet
from django.shortcuts import get_object_or_404

from users.models import GlobalRole

from .models import MembershipRole, ProjectMembership, ResearchProject


def is_platform_admin(user) -> bool:
    """True for GlobalRole.ADMIN or Django staff."""
    if user is None or not getattr(user, "is_authenticated", False):
        return False
    return getattr(user, "role", None) == GlobalRole.ADMIN or bool(
        getattr(user, "is_staff", False)
    )


def projects_visible_to(user) -> QuerySet[ResearchProject]:
    """Projects the user may see: all if admin, else owner ∪ membership."""
    qs = ResearchProject.objects.select_related("owner")
    if is_platform_admin(user):
        return qs.all()
    return qs.filter(Q(owner=user) | Q(memberships__user=user)).distinct()


def get_visible_project(user, pk: int) -> ResearchProject:
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
