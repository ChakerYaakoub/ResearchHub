"""Shared user-create helpers (register + admin create-admin)."""

import secrets
import string

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

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
    """Build a unique username from preferred or email local-part."""
    username = (preferred or "").strip() or email.split("@")[0]
    base = username
    suffix = 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{suffix}"
        suffix += 1
    return username
