"""Facilities app — installations and instruments catalog."""

from django.apps import AppConfig


class FacilitiesConfig(AppConfig):
    """Django app config for facility/instrument catalog (client read + admin CRUD)."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "facilities"
