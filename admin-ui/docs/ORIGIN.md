# Origin allowlist (`ADMIN_UI_ORIGINS`)

Admin-only Django routes (`/api/admin/*`, proposal approve/reject) require:

1. Authenticated platform ADMIN / SUPER_ADMIN
2. Request `Origin` (or equivalent) in backend setting **`ADMIN_UI_ORIGINS`**

client-ui Origin must **not** be listed there for those routes. Tokens are also separate per UI origin.

## Local defaults

| Variable | Typical local value |
|----------|---------------------|
| `ADMIN_UI_PORT` | `5175` |
| `ADMIN_UI_ORIGINS` | `http://localhost:5175` |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` |

If you change the admin-ui port, update `ADMIN_UI_ORIGINS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` in the root `.env`.

## Production

Serve admin-ui on its public origin and set `ADMIN_UI_ORIGINS` to that exact origin (scheme + host + port if non-default). Rebuild is not required for backend Origin changes; restart Django after env updates.

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
