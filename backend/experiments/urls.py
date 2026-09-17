"""Experiment API routes."""

from django.urls import path

from experiments.admin_api.views import AdminExperimentListView
from experiments.api.views import ExperimentDetailView, ProjectExperimentListCreateView

urlpatterns = [
    path(
        "projects/<int:project_pk>/experiments/",
        ProjectExperimentListCreateView.as_view(),
        name="project-experiments",
    ),
    path(
        "experiments/<int:pk>/",
        ExperimentDetailView.as_view(),
        name="experiment-detail",
    ),
    path(
        "admin/experiments/",
        AdminExperimentListView.as_view(),
        name="admin-experiments",
    ),
]
