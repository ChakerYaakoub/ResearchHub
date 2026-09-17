# ResearchHub Backend — Security & Validation Rules

Never trust `client-ui` or `admin-ui`. Every write path must validate on the server.

Shared helpers live in `core/validation.py`. Auth abuse controls: `core/honeypot.py`, `core/ratelimit.py`. AuthZ: `core/permissions.py` + filtered selectors.

---

## Request flow

```text
Request
  ↓
DRF type / format / constraints   (field classes; final value must be correct)
  ↓
Character + HTML validation       (core.validation)
  ↓
Relationships                     (FKs exist; nest under authorized parent)
  ↓
Authentication + Authorization    (JWT + permissions + filtered querysets)
  ↓
Business rules / services
  ↓
Database constraints              (unique, FK, choices — last line of defense)
  ↓
Response                          (no secrets / server-only tokens leaked)
```

---

## Validation layers (apply in order)

### 1. Type

Use the correct DRF / model field so input is parsed and the **final validated value** has the right type:

| Intent  | Prefer                                                |
| ------- | ----------------------------------------------------- |
| Text    | `CharField` / `EmailField` / `URLField` / `UUIDField` |
| Number  | `IntegerField` / `DecimalField`                       |
| Flag    | `BooleanField`                                        |
| Instant | `DateTimeField` / `DateField`                         |
| Enum    | `ChoiceField` or model `choices`                      |

DRF may legitimately coerce some representations (e.g. `"123"` → `123` for integer fields). That is fine. What matters: after validation, the value is the expected type and passes constraints. Unparseable or unsafe input must still fail with 400 — do not invent fallbacks that weaken security.

### 2. Required

- Mark required fields explicitly (`required=True`, model `blank=False`).
- Decide empty vs null: prefer `""` for optional text; avoid storing HTML/`null` surprises.
- Optional profile fields may be blank; business-critical fields (e.g. project title, publication title/authors) must not be blank after sanitize.

### 3. Format

- Email: `EmailField` + normalize (`lower().strip()`), uniqueness via `normalize_unique_email` where creating users.
- URL: `URLField`.
- UUID path/body IDs: `UUIDField` / UUID model PKs.
- Datetimes: timezone-aware DRF fields.
- Do not invent formats in the UI only — always re-check here.

### 4. Constraints

- Enforce `max_length` / min length (username ≥ 3, titles ≤ 255, codes ≤ 64).
- Choices for status/role/kind must match model enums.
- Uniqueness where it is a **business** property: email, username (case-insensitive where checked), membership `(project, user)`, instrument `(installation, code)`.
- Invitation `token`: DB `unique=True` is appropriate for crypto random values, but the **security** properties are unpredictability, expiry (7 days), and controlled exposure — not “uniqueness” alone.

### 5. Character / content

| Field                      | Allowed content                                            |
| -------------------------- | ---------------------------------------------------------- |
| `username`                 | `[A-Za-z0-9_-]+` via `validate_username`                   |
| `first_name` / `last_name` | Letters (incl. common accents), spaces, hyphen, apostrophe |
| Facility `code`            | Alphanumeric, `_`, `-` via `validate_code`                 |
| Free text                  | Plain text only — see HTML                                 |

Auto-derived usernames from email local-parts are scrubbed with `username_from_email_local`.

### 6. HTML

- **HTML is not allowed** in user-supplied text fields.
- Detect **tag-like markup** (e.g. `<script>…</script>`, `<b>…</b>`) and reject with 400 — not a naive “any `<` / `>`” blacklist.
- Scientific comparisons like `T < 300` (no tags) remain allowed.
- Do not rely on the frontend to strip tags.
- Prefer reject-over-silent-strip so clients know to fix input.

Implementation: `core.validation.sanitize_plain_text` / `assert_no_html`.

### 7. Security

- Parameterized ORM only — no raw SQL with user strings.
- Passwords: Django validators + `set_password` (never store plaintext).
- **Never expose** internal/server-only secrets, credentials, SMTP passwords, or invitation tokens in normal API list/detail responses (token only on create / invitee “my invitations” where the product requires it).
- **Never trust** client-provided `role`, `owner`, `project`, `installation`, or permission/capability fields to grant access — set owner/role server-side; take parent project/installation from the authorized URL/object; AuthZ from JWT + permissions + selectors.
- Public auth: rate limits (`AUTH_RATE_LIMIT`, `PASSWORD_RESET_RATE_LIMIT`) and honeypot field `company` (ignore when filled).
- Secrets and SMTP only via environment variables (see root `.env.example`).
- Invitation tokens: cryptographically secure (`secrets.token_urlsafe`), expire in 7 days, email match on accept.
- Admin API: platform ADMIN **and** `Origin` ∈ `ADMIN_UI_ORIGINS`.

### 8. Relationships

- FK targets must exist (DRF/`PrimaryKeyRelatedField` / model FK).
- Nest under the project from the URL / permission-checked object — clients must not re-parent resources.
- Instrument selection: must be AVAILABLE and installation ACTIVE (`assert_instrument_selectable`).

### 9. Authorization (IDOR)

- Authenticate private endpoints (JWT).
- Project access: owner, collaborator (editor/viewer), or platform admin — via permissions **and** filtered querysets/selectors (`projects_visible_to`, `get_visible_*`).
- Never trust a client-supplied owner/project/installation id alone without visibility checks.
- Invitation accept/decline: authenticated user’s email must match the invitation email.

### 10. Cross-field validation

Examples already enforced:

- Password change: `new_password` requires correct `current_password`.
- Email cannot be changed on `/api/auth/me/`.
- Login: credentials + `is_active`.
- Experiment create/update: instrument selectable when changed.

Add serializer `validate()` when two fields must agree (e.g. date ranges if introduced).

### 11. Business rules

Belong in `services.py` (not only the UI):

- Proposal submit / approve / reject transitions.
- Project complete and mutate gates for experiments/publications.
- Invitation create / accept / decline / cancel / expiry.
- Role rules (researcher self-register; only SUPER_ADMIN creates ADMIN).

Views stay thin: validate input → permission → service → response.

### 12. Database constraints

Models remain the last line of defense:

- UUID PKs, `unique=True`, `UniqueConstraint`, FK `on_delete`, `choices`.
- Do not remove DB constraints because the serializer “already checks”.
- Prefer failing closed on integrity errors rather than inventing partial rows.

---

## Where enforcement lives

| Layer                          | Location                                                      |
| ------------------------------ | ------------------------------------------------------------- |
| Shared text/username/code/HTML | `core/validation.py`                                          |
| AuthZ / admin Origin           | `core/permissions.py`, `core/api.py`                          |
| Auth rate limit / honeypot     | `users/api/views.py`, `core/ratelimit.py`, `core/honeypot.py` |
| Serializers (type → content)   | `<app>/api/serializers.py`, `facilities/serializers.py`       |
| Workflows                      | `<app>/services.py`                                           |
| Visibility / IDOR queries      | `<app>/selectors.py`                                          |
| Schema                         | `<app>/models.py` + migrations                                |

---

## Checklist for new endpoints

1. Correct field types and required flags (final validated type + constraints).
2. Format + constraints + character rules (reuse `core.validation`).
3. Reject HTML **tags**; allow plain scientific `<` where appropriate.
4. Resolve related objects from permission-filtered querysets; do not trust client role/owner/parent ids.
5. Object-level permission before mutate.
6. Business rules in a service when the flow is non-CRUD.
7. Confirm matching DB constraints exist or add a migration.
8. Response must not leak secrets or unnecessary tokens.
9. Add a focused test (happy path + one abuse/IDOR/validation failure).

Also follow `.cursor/rules/security.mdc` and `docs/API.md`.
