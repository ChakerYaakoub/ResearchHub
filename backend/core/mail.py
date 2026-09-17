"""Shared plain-text email sending (Django SMTP / console via settings)."""

import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

EMAIL_SIGNATURE = (
    "Sincerely,\n"
    "ResearchHub User Office\n"
    "\n"
    "Do not reply to this email."
)


def _with_signature(message: str) -> str:
    """Append the default ResearchHub signature once."""
    body = message.rstrip()
    if body.endswith(EMAIL_SIGNATURE):
        return body + "\n"
    return f"{body}\n\n{EMAIL_SIGNATURE}\n"


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
    instead of wiring SMTP details in each feature. Always appends the
    ResearchHub User Office signature.
    """
    recipients = (
        [to.strip()] if isinstance(to, str) else [addr.strip() for addr in to]
    )
    sender = from_email or settings.DEFAULT_FROM_EMAIL
    body = _with_signature(message)
    try:
        send_mail(
            subject=subject,
            message=body,
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
