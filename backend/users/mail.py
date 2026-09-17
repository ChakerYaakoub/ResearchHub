"""User-facing emails (admin welcome, registration welcome)."""

from django.conf import settings
from django.utils import timezone

from core.mail import send_app_email
from users.models import User


def _greeting_name(user: User) -> str:
    full = f"{user.first_name} {user.last_name}".strip()
    return full or user.username


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
        "Please change this password on your account page."
    )
    return send_app_email(
        subject=subject,
        message=body,
        to=user.email,
        purpose="admin welcome",
    )


def send_registration_welcome_email(user: User) -> bool:
    """Thank-you email after researcher registration (never blocks create)."""
    when = timezone.localtime(user.date_joined).strftime("%d/%m/%Y %H:%M")
    subject = "Welcome to ResearchHub"
    body = (
        f"Dear {_greeting_name(user)},\n\n"
        f"We thank you for your registration on {when}.\n\n"
        "This is your login information:\n"
        f"email: {user.email}\n"
        f"username: {user.username}\n"
    )
    return send_app_email(
        subject=subject,
        message=body,
        to=user.email,
        purpose="registration welcome",
    )
