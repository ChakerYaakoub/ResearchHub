# Troubleshooting

## API calls fail / CORS

- Confirm `VITE_API_BASE_URL` includes `/api`.
- Admin origin must be in `CORS_ALLOWED_ORIGINS`.
- Restart Compose after env changes.

## Admin API returns 403 (Origin)

Admin routes require Origin ∈ `ADMIN_UI_ORIGINS`. Calling them from client-ui Origin fails even with a valid admin JWT. See [ORIGIN.md](./ORIGIN.md).

## Login says admin only

User role is not `SUPER_ADMIN` or `ADMIN`. Researchers use client-ui.

## Redirected from `/admins`

Only `SUPER_ADMIN` may open Admins (UX gate). Backend also restricts create-admin.

## 401 loops / forced logout

Refresh failed. Clear `rh_admin_access`, `rh_admin_refresh`, `rh_admin_user` and sign in again.

## Tests fail in Docker

```bash
make start
make test-admin-ui
```

Ensure the `admin-ui` container is running before `exec`.

## Related

- [DEVELOPMENT.md](./DEVELOPMENT.md) · [AUTHENTICATION.md](./AUTHENTICATION.md) · [ORIGIN.md](./ORIGIN.md)
