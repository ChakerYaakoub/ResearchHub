"""Project API routes."""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminStatsView,
    ProjectCollaboratorDeleteView,
    ProjectCollaboratorListView,
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
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    *router.urls,
]
