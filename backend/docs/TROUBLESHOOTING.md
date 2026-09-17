# Troubleshooting

## Backend container will not start / cannot connect to DB

- Ensure Compose is up: `make ps` or `docker compose ps`.
- Backend expects `DATABASE_HOST=postgres` inside Compose.
- Check logs: `make logs` or `docker compose logs backend postgres`.
- After volume wipe (`make clean`), wait for postgres health then `make migrate` if migrate did not run on start.

## Migration / UUID reset errors

Domain PKs are UUIDs. After pulling a UUID migration reset:

```bash
make clean
make start
```

Do not reuse an old Postgres volume with integer PKs against UUID migrations.

## CORS / CSRF errors from the UI

- UI origin must appear in `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`.
- If you changed `CLIENT_UI_PORT` / `ADMIN_UI_PORT`, update those lists and restart.

## Admin API returns 403

Admin routes need **both**:

1. Platform ADMIN (or SUPER_ADMIN) JWT
2. Request `Origin` (or usable `Referer`) in `ADMIN_UI_ORIGINS`

Common mistakes: calling from client-ui Origin, missing Origin header in tests/tools, researcher JWT.

Use `admin_client()` from `test_helpers.py` in tests.

## Auth rate limit (429)

Public login/register/password-reset are rate-limited per IP (`AUTH_RATE_LIMIT`, `PASSWORD_RESET_RATE_LIMIT`). LocMem cache resets on container restart. Wait or restart backend during local abuse testing.

## Invitation email missing

- Local default is **console** email backend — check backend logs.
- Invitation row is still created if SMTP fails (logged); accept remains in-app.
- Confirm `CLIENT_UI_ORIGIN` has no trailing slash and points at client-ui.

## Soft-deleted projects

Client `DELETE` sets `SOFT_DELETED` and hides the project from researcher lists. Platform admins still see them in `/api/admin/projects/`. Hard delete is an admin-panel operation.

## Tests fail in Docker

```bash
make start
make test-backend
```

Ensure the backend container is running before `exec`. Prefer Make targets over host Python.

## Related

- Development: [DEVELOPMENT.md](./DEVELOPMENT.md)
- Authorization: [AUTHORIZATION.md](./AUTHORIZATION.md)
- Security: [SECURITY.md](./SECURITY.md)
