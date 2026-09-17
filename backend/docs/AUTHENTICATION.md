# Authentication

JWT authentication via `djangorestframework-simplejwt`. JWT proves **who** the caller is; it does **not** grant project or admin privileges by itself (see [AUTHORIZATION.md](./AUTHORIZATION.md)).

## Endpoints (`/api/auth/`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/register/` | Public | Create RESEARCHER; return access + refresh + user |
| POST | `/api/auth/login/` | Public | Email + password → tokens + user |
| POST | `/api/auth/refresh/` | Public | Rotate refresh → new access (+ new refresh) |
| POST | `/api/auth/logout/` | Authenticated | Blacklist refresh token |
| GET | `/api/auth/me/` | Authenticated | Current user profile |
| PATCH | `/api/auth/me/` | Authenticated | Update profile / password (email immutable) |
| POST | `/api/auth/password-reset/` | Public | Request reset email (no user enumeration) |
| POST | `/api/auth/password-reset/confirm/` | Public | Confirm token + set new password |

Implementation: `users/api/views.py`, `users/api/serializers.py`, routes in `users/urls.py`.

## Token usage

1. Register or login → `{ "access", "refresh", "user" }`.
2. Send `Authorization: Bearer <access>` on private endpoints.
3. Refresh when access expires (`POST /api/auth/refresh/` with `{ "refresh" }`).
4. Logout blacklists the refresh token (`token_blacklist` app).

Settings (`config/settings.py`):

- Access lifetime: **60 minutes**
- Refresh lifetime: **7 days**
- `ROTATE_REFRESH_TOKENS` + `BLACKLIST_AFTER_ROTATION`: **True**

Default DRF authentication: JWT, then Session (browsable API only). Default permission: `IsAuthenticated` (public auth views override to `AllowAny`).

## User model

Custom `users.User` (`AUTH_USER_MODEL`):

- UUID primary key
- **Email** as `USERNAME_FIELD` (unique)
- Global `role`: `SUPER_ADMIN` | `ADMIN` | `RESEARCHER` (self-register → RESEARCHER)
- `createsuperuser` sets `SUPER_ADMIN`

## Abuse controls

| Control | Where | Behavior |
|---------|-------|----------|
| Rate limit | `core/ratelimit.py` + env | Login/register: `AUTH_RATE_LIMIT` (default `5/m` per IP). Password reset: `PASSWORD_RESET_RATE_LIMIT` (default `2/m`). Exceed → **429**. |
| Honeypot | `core/honeypot.py` | Field name `company`. If filled, request is **silently ignored** (success-shaped response without creating session/user side effects as implemented). |

## Password reset

- Request always returns success-shaped response for known and unknown emails (anti-enumeration).
- Confirm uses Django’s password-reset token machinery; weak passwords rejected by validators.
- Emails go through `users/mail.py` → `core.mail.send_app_email`.

## Origins and tokens

client-ui and admin-ui are **separate origins**. Tokens are stored per UI; do not share JWTs across apps. Researchers authenticate on client-ui; platform admins on admin-ui.

## Related

- Security: [SECURITY.md](./SECURITY.md)
- Authorization: [AUTHORIZATION.md](./AUTHORIZATION.md)
