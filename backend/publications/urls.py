"""Publication API routes."""

from django.urls import path

from publications.admin_api.views import AdminPublicationListView
from publications.api.views import ProjectPublicationListCreateView, PublicationDetailView

urlpatterns = [
    path(
        "projects/<uuid:project_pk>/publications/",
        ProjectPublicationListCreateView.as_view(),
        name="project-publications",
    ),
    path(
        "publications/<uuid:pk>/",
        PublicationDetailView.as_view(),
        name="publication-detail",
    ),
    path(
        "admin/publications/",
        AdminPublicationListView.as_view(),
        name="admin-publications",
    ),
]
