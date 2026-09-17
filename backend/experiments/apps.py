"""Experiments app — planned/executed experiments nested under projects."""

from django.apps import AppConfig


class ExperimentsConfig(AppConfig):
    """Django app config for project experiments and instrument booking."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "experiments"
