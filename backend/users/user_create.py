"""Shared user-create helpers (register + admin create-admin)."""

import secrets
import string

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from core.validation import username_from_email_local, validate_username
from users.models import User

_TEMP_PASSWORD_ALPHABET = string.ascii_letters + string.digits


def generate_temporary_password(length: int = 8) -> str:
    """Cryptographically random alphanumeric password (default 8 chars)."""
    return "".join(secrets.choice(_TEMP_PASSWORD_ALPHABET) for _ in range(length))


def normalize_unique_email(value: str) -> str:
    email = value.lower().strip()
    if User.objects.filter(email__iexact=email).exists():
        raise serializers.ValidationError("A user with this email already exists.")
    return email


def validate_user_password(value: str) -> str:
    validate_password(value)
    return value


def unique_username_from_email(email: str, preferred: str | None = None) -> str:
    """Build a unique username from preferred (validated) or email local-part."""
    preferred_clean = (preferred or "").strip()
    if preferred_clean:
        username = validate_username(preferred_clean)
    else:
        username = username_from_email_local(email)
    base = username
    suffix = 1
    while User.objects.filter(username__iexact=username).exists():
        # Keep within max length when appending a numeric suffix.
        suffix_str = str(suffix)
        username = f"{base[: 150 - len(suffix_str)]}{suffix_str}"
        suffix += 1
    return username
