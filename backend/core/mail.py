"""Shared plain-text email sending (Django SMTP / console via settings)."""

import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_app_email(
    *,
    subject: str,
    message: str,
    to: str | list[str],
    from_email: str | None = None,
    fail_silently: bool = True,
    purpose: str = "email",
) -> bool:
    """Send plain text via Django ``send_mail``; log failures when silent.

    Call this from domain services (invitations, future notifications, …)
    instead of wiring SMTP details in each feature.
    """
    recipients = (
        [to.strip()] if isinstance(to, str) else [addr.strip() for addr in to]
    )
    sender = from_email or settings.DEFAULT_FROM_EMAIL
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=sender,
            recipient_list=recipients,
            fail_silently=False,
        )
        return True
    except Exception:
        logger.exception(
            "Failed to send %s: to=%s subject=%r",
            purpose,
            recipients,
            subject,
        )
        if not fail_silently:
            raise
        return False
