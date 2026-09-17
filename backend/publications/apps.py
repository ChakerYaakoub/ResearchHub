"""Publications app — existing/resulting publications nested under projects."""

from django.apps import AppConfig


class PublicationsConfig(AppConfig):
    """Django app config for project-linked publications."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "publications"
