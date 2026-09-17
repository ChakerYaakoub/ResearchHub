"""Users app — custom User model, JWT auth API, and admin user management."""

from django.apps import AppConfig


class UsersConfig(AppConfig):
    """Django app config for authentication and platform user administration."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "users"
