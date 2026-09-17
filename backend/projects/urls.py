"""Project API routes."""

from django.urls import path
from rest_framework.routers import DefaultRouter

from projects.admin_api.views import (
    AdminInvitationCancelView,
    AdminInvitationListView,
    AdminProjectDetailView,
    AdminProjectListView,
    AdminStatsView,
)
from projects.api.views import (
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
    path("admin/projects/", AdminProjectListView.as_view(), name="admin-projects"),
    path(
        "admin/projects/<int:project_id>/",
        AdminProjectDetailView.as_view(),
        name="admin-project-detail",
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
