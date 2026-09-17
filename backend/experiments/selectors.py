"""Experiment visibility helpers (project-scoped IDOR)."""

from django.shortcuts import get_object_or_404

from projects.selectors import projects_visible_to

from .models import Experiment


def get_visible_experiment(user, pk: int) -> Experiment:
    """Experiment under a project visible to the user (404 otherwise)."""
    return get_object_or_404(
        Experiment.objects.select_related("project").filter(
            project__in=projects_visible_to(user)
        ),
        pk=pk,
    )
