"""Welcome email when SUPER_ADMIN creates a platform ADMIN."""

from django.conf import settings

from core.mail import send_app_email
from users.models import User


def send_admin_welcome_email(user: User, plain_password: str) -> bool:
    """Email login credentials; caller must roll back user if this returns False."""
    origins = settings.ADMIN_UI_ORIGINS
    login_url = origins[0].rstrip("/") if origins else "http://localhost:5175"

    subject = "Your ResearchHub admin account"
    body = (
        "A ResearchHub platform admin account has been created for you.\n\n"
        f"Email: {user.email}\n"
        f"Temporary password: {plain_password}\n\n"
        f"Sign in at: {login_url}\n\n"
        "Please change this password later (a change-password page will be "
        "available in ResearchHub).\n\n"
        "Do not reply to this email.\n"
    )
    return send_app_email(
        subject=subject,
        message=body,
        to=user.email,
        purpose="admin welcome",
    )
