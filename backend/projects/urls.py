"""Project API routes."""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .admin_views import (
    AdminAdminListView,
    AdminExperimentListView,
    AdminInvitationCancelView,
    AdminInvitationListView,
    AdminProjectDetailView,
    AdminProjectListView,
    AdminProposalListView,
    AdminPublicationListView,
    AdminUserDetailView,
    AdminUserListView,
)
from .views import (
    AdminStatsView,
    ProjectCollaboratorDeleteView,
    ProjectCollaboratorListView,
    ProjectCompleteView,
    ResearchProjectViewSet,
)

router = DefaultRouter()
router.register("projects", ResearchProjectViewSet, basename="project")

urlpatterns = [
    path(
        "projects/<int:project_pk>/collaborators/",
        ProjectCollaboratorListView.as_view(),
        name="project-collaborators",
    ),
    path(
        "projects/<int:project_pk>/collaborators/<int:user_id>/",
        ProjectCollaboratorDeleteView.as_view(),
        name="project-collaborator-delete",
    ),
    path(
        "projects/<int:project_pk>/complete/",
        ProjectCompleteView.as_view(),
        name="project-complete",
    ),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path(
        "admin/users/<int:user_id>/",
        AdminUserDetailView.as_view(),
        name="admin-user-detail",
    ),
    path("admin/admins/", AdminAdminListView.as_view(), name="admin-admins"),
    path("admin/projects/", AdminProjectListView.as_view(), name="admin-projects"),
    path(
        "admin/projects/<int:project_id>/",
        AdminProjectDetailView.as_view(),
        name="admin-project-detail",
    ),
    path(
        "admin/proposals/",
        AdminProposalListView.as_view(),
        name="admin-proposals",
    ),
    path(
        "admin/experiments/",
        AdminExperimentListView.as_view(),
        name="admin-experiments",
    ),
    path(
        "admin/publications/",
        AdminPublicationListView.as_view(),
        name="admin-publications",
    ),
    path(
        "admin/invitations/",
        AdminInvitationListView.as_view(),
        name="admin-invitations",
    ),
    path(
        "admin/invitations/<int:invitation_id>/",
        AdminInvitationCancelView.as_view(),
        name="admin-invitation-cancel",
    ),
    *router.urls,
]
