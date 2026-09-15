"""Publication API routes."""

from django.urls import path

from .views import ProjectPublicationListCreateView, PublicationDetailView

urlpatterns = [
    path(
        "projects/<int:project_pk>/publications/",
        ProjectPublicationListCreateView.as_view(),
        name="project-publications",
    ),
    path(
        "publications/<int:pk>/",
        PublicationDetailView.as_view(),
        name="publication-detail",
    ),
]
