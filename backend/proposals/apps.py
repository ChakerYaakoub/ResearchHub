"""Proposals app — one proposal per project; submit / approve / reject workflows."""

from django.apps import AppConfig


class ProposalsConfig(AppConfig):
    """Django app config for scientific proposal review."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "proposals"
