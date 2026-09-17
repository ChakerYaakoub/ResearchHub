"""Invitations app — email invitations, secure tokens, accept/decline membership."""

from django.apps import AppConfig


class InvitationsConfig(AppConfig):
    """Django app config for project collaboration invitations."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "invitations"
