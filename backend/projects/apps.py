"""Projects app — research projects, memberships, lifecycle, admin stats."""

from django.apps import AppConfig


class ProjectsConfig(AppConfig):
    """Django app config for scientific projects and collaborator memberships."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "projects"
