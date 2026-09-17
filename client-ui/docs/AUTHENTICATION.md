# Authentication

Modal-based JWT auth for researchers. Tokens are **per origin** — stored only in client-ui `localStorage`, separate from admin-ui sessions.

## Flow

```text
Login / Register (AuthModal)
  → POST /auth/login/ or /auth/register/
  → save access + refresh + user (localStorage)
  → AuthProvider state
  → apiFetch(..., { token: access })
  → on 401: POST /auth/refresh/ (single-flight) → retry
  → Logout: POST /auth/logout/ (best-effort) → clear storage
```

## Storage keys (`authStorage` / related)

| Key | Store | Purpose |
|-----|-------|---------|
| `rh_access` | localStorage | Access JWT |
| `rh_refresh` | localStorage | Refresh JWT |
| `rh_user` | localStorage | Cached user profile |
| `rh_invite_token` | sessionStorage | Pending invitation token from deep link |
| `rh_reset_uid` / `rh_reset_token` | sessionStorage | Password-reset deep link |
| `rh_open_login` | sessionStorage | Flag to open login after navigation |

## Modules

| Module | Role |
|--------|------|
| `AuthContext` / `useAuth` | `user`, `access`, `login`, `register`, `logout`, `setUser` |
| `authApi` | Register, login, logout, me, password reset |
| `tokenSession` | `ensureFreshAccess`, `onAuthTokensChange` |
| `AuthUiProvider` | Modal open/mode (`login` \| `register` \| `forgot` \| `reset`) |
| `AuthModal` + forms | Formik UI; honeypot field `company` |

## Auth API paths (under `VITE_API_BASE_URL`)

| Method | Path |
|--------|------|
| POST | `/auth/register/` |
| POST | `/auth/login/` |
| POST | `/auth/logout/` |
| POST | `/auth/refresh/` |
| GET / PATCH | `/auth/me/` |
| POST | `/auth/password-reset/` |
| POST | `/auth/password-reset/confirm/` |

## Related

- [ROUTING.md](./ROUTING.md) · [API.md](./API.md) · [FORMS.md](./FORMS.md)
