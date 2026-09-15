"""Experiment API routes."""

from django.urls import path

from .views import ExperimentDetailView, ProjectExperimentListCreateView

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
]
