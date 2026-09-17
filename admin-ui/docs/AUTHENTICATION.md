# Authentication

Page-based JWT auth for platform admins. Tokens are **per origin** — stored only in admin-ui `localStorage` (`rh_admin_*`), separate from client-ui (`rh_*`).

## Flow

```text
/login (Formik)
  → POST /auth/login/
  → isPlatformAdminRole(user.role)?  # SUPER_ADMIN | ADMIN
  → save access + refresh + user
  → AuthProvider
  → apiFetch(..., { token: access })
  → on 401: POST /auth/refresh/ (single-flight) → retry
  → Logout: POST /auth/logout/ (best-effort) → clear storage → /login
```

Researchers who log in successfully at the API are rejected in `AuthContext.login` with a 403-style `ApiError` (`copy.adminOnly`) and storage is cleared.

## Storage keys

| Key | Store | Purpose |
|-----|-------|---------|
| `rh_admin_access` | localStorage | Access JWT |
| `rh_admin_refresh` | localStorage | Refresh JWT |
| `rh_admin_user` | localStorage | Cached user profile |

## Modules

| Module | Role |
|--------|------|
| `AuthContext` / `useAuth` | `user`, `access`, `isSuperAdmin`, `login`, `logout`, `setUser` |
| `authApi` (`api/auth.ts`) | Login, logout, me, password reset |
| `tokenSession` | `ensureFreshAccess`, `onAuthTokensChange` |

## Auth API paths (under `VITE_API_BASE_URL`)

| Method | Path |
|--------|------|
| POST | `/auth/login/` |
| POST | `/auth/logout/` |
| POST | `/auth/refresh/` |
| GET / PATCH | `/auth/me/` |
| POST | `/auth/password-reset/` |

## Related

- [AUTHORIZATION.md](./AUTHORIZATION.md) · [ORIGIN.md](./ORIGIN.md) · [API.md](./API.md)
