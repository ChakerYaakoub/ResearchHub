"""Cross-cutting helpers — no domain models.

Holds permissions, validation, mail, rate limit, honeypot, and admin list
filters shared by domain apps. Keep domain workflows in their own apps.
"""

from django.apps import AppConfig


class CoreConfig(AppConfig):
    """Django app config for shared ResearchHub infrastructure."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "core"
    verbose_name = "Core"
