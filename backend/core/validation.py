"""Shared input validation for ResearchHub APIs (type/format already via DRF fields)."""

from __future__ import annotations

import re

from rest_framework import serializers

# Letters, digits, underscore, hyphen (ASCII — matches public auth UX).
USERNAME_RE = re.compile(r"^[A-Za-z0-9_-]+$")
# Person names: letters (incl. common Latin accents), spaces, hyphen, apostrophe.
PERSON_NAME_RE = re.compile(r"^[A-Za-zÀ-ÖØ-öø-ÿ](?:[A-Za-zÀ-ÖØ-öø-ÿ' -]*[A-Za-zÀ-ÖØ-öø-ÿ])?$")
# Facility / instrument codes.
CODE_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]*$")
# Tag-like markup (reject rather than silently strip, so clients fix input).
_HTML_TAG_RE = re.compile(r"</?[a-zA-Z][^>]*>")

USERNAME_MIN_LENGTH = 3
USERNAME_MAX_LENGTH = 150
TITLE_MAX_LENGTH = 255
DOI_MAX_LENGTH = 255
CODE_MAX_LENGTH = 64


def assert_no_html(value: str) -> str:
    """Reject strings that contain HTML/XML-like tags."""
    if value and _HTML_TAG_RE.search(value):
        raise serializers.ValidationError("HTML is not allowed in this field.")
    return value


def sanitize_plain_text(value: str, *, multiline: bool = False) -> str:
    """
    Normalize free text: drop null bytes, trim, reject HTML tags.

    Single-line fields collapse internal whitespace; multiline keeps newlines.
    """
    if value is None:
        return value
    text = str(value).replace("\x00", "")
    assert_no_html(text)
    if multiline:
        return text.strip()
    return " ".join(text.split())


def validate_username(value: str) -> str:
    """Username: required non-blank, length, letters/digits/_/- only, no HTML."""
    username = sanitize_plain_text(value)
    if not username:
        raise serializers.ValidationError("Username cannot be blank.")
    if len(username) < USERNAME_MIN_LENGTH:
        raise serializers.ValidationError(
            f"Username must be at least {USERNAME_MIN_LENGTH} characters."
        )
    if len(username) > USERNAME_MAX_LENGTH:
        raise serializers.ValidationError(
            f"Username must be at most {USERNAME_MAX_LENGTH} characters."
        )
    if not USERNAME_RE.fullmatch(username):
        raise serializers.ValidationError(
            "Username may only contain letters, numbers, underscores, and hyphens."
        )
    return username


def validate_person_name(value: str, *, allow_blank: bool = True) -> str:
    """Optional first/last name — letters and common name punctuation only."""
    name = sanitize_plain_text(value)
    if not name:
        if allow_blank:
            return ""
        raise serializers.ValidationError("This field may not be blank.")
    if len(name) > 150:
        raise serializers.ValidationError("Name must be at most 150 characters.")
    if not PERSON_NAME_RE.fullmatch(name):
        raise serializers.ValidationError(
            "Name may only contain letters, spaces, hyphens, and apostrophes."
        )
    return name


def validate_title(value: str) -> str:
    """Required short title (projects, publications, etc.)."""
    title = sanitize_plain_text(value)
    if not title:
        raise serializers.ValidationError("This field may not be blank.")
    if len(title) > TITLE_MAX_LENGTH:
        raise serializers.ValidationError(
            f"Ensure this field has no more than {TITLE_MAX_LENGTH} characters."
        )
    return title


def validate_optional_text(value: str, *, multiline: bool = True) -> str:
    """Optional long text (description, notes, methodology, …)."""
    if value is None:
        return ""
    return sanitize_plain_text(value, multiline=multiline)


def validate_code(value: str) -> str:
    """Installation/instrument code: alphanumerics with _/- after first char."""
    code = sanitize_plain_text(value)
    if not code:
        raise serializers.ValidationError("This field may not be blank.")
    if len(code) > CODE_MAX_LENGTH:
        raise serializers.ValidationError(
            f"Ensure this field has no more than {CODE_MAX_LENGTH} characters."
        )
    if not CODE_RE.fullmatch(code):
        raise serializers.ValidationError(
            "Code may only contain letters, numbers, underscores, and hyphens."
        )
    return code


def username_from_email_local(email: str) -> str:
    """Derive a username-safe base from the email local-part."""
    local = email.split("@", 1)[0]
    cleaned = re.sub(r"[^A-Za-z0-9_-]", "_", local).strip("_")
    if not cleaned:
        cleaned = "user"
    if len(cleaned) < USERNAME_MIN_LENGTH:
        cleaned = (cleaned + "user")[:USERNAME_MIN_LENGTH]
    return cleaned[:USERNAME_MAX_LENGTH]
