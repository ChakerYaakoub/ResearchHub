"""Honeypot helpers for public auth forms (bots that fill them are ignored)."""

HONEYPOT_FIELD = "company"


def honeypot_filled(data) -> bool:
    """True when the hidden honeypot field was submitted with a non-empty value."""
    if data is None:
        return False
    value = data.get(HONEYPOT_FIELD)
    if value is None:
        return False
    return bool(str(value).strip())
