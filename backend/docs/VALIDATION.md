# Validation

All write paths validate on the server. Never trust `client-ui` or `admin-ui`.

Full rules: [SECURITY.md](./SECURITY.md). This page summarizes how validation is applied in practice.

## Request flow (layers)

```text
Request
  ↓
DRF type / format / constraints     (serializer field classes)
  ↓
Character + HTML validation         (core.validation)
  ↓
Relationships                       (FKs; nest under authorized parent)
  ↓
Authentication + Authorization      (JWT + permissions + selectors)
  ↓
Business rules / services
  ↓
Database constraints                (unique, FK, choices)
  ↓
Response                            (no secrets / tokens leaked)
```

## Shared helpers (`core/validation.py`)

| Helper | Purpose |
|--------|---------|
| `assert_no_html` / `sanitize_plain_text` | Reject HTML **tags**; allow scientific comparisons like `T < 300` |
| `validate_username` | `[A-Za-z0-9_-]+`, min length 3 |
| `validate_person_name` | Letters (incl. accents), spaces, hyphen, apostrophe |
| `validate_code` | Facility/instrument codes: alnum, `_`, `-` |
| `validate_title` | Required non-empty after trim/sanitize |
| `username_from_email_local` | Derive safe username from email local-part |

Serializers call these helpers; charset and HTML rules are not duplicated in views.

## Where enforcement lives

| Concern | Location |
|---------|----------|
| Text/username/code/HTML | `core/validation.py` |
| AuthZ / admin Origin | `core/permissions.py`, selectors |
| Auth rate limit / honeypot | `users/api/views.py`, `core/ratelimit.py`, `core/honeypot.py` |
| Field types & cross-field rules | `<app>/api/serializers.py`, `facilities/serializers.py` |
| Workflows | `<app>/services.py` |
| Visibility / IDOR | `<app>/selectors.py` |
| Schema last line of defense | `<app>/models.py` + migrations |

## Notable cross-field rules

- Password change on `/api/auth/me/`: `new_password` requires correct `current_password`.
- Email cannot be changed on `/me/`.
- Login requires credentials + `is_active`.
- Experiment create/update: instrument must be AVAILABLE under an ACTIVE installation (`assert_instrument_selectable` in facilities).
- Invitation accept: authenticated email must match invitation email.

## Checklist for new endpoints

1. Correct field types and required flags.
2. Reuse `core.validation` for text/username/code/HTML.
3. Resolve related objects from permission-filtered querysets.
4. Object-level permission before mutate.
5. Business rules in a service when non-CRUD.
6. Matching DB constraints.
7. Response must not leak secrets or unnecessary invitation tokens.
8. Focused test: happy path + one abuse/IDOR/validation failure.

See [SECURITY.md](./SECURITY.md) for the full security rules.
