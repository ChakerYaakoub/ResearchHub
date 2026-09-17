# Deployment & CI/CD

## Local vs production

| Concern | Local | Production target |
|---------|-------|-------------------|
| Orchestration | Docker Compose (`make start`) | Static assets behind Nginx |
| URL | `http://localhost:${CLIENT_UI_PORT}` | Public domain / host path |
| API base | `VITE_API_BASE_URL` (e.g. `http://localhost:8000/api`) | Public API origin including `/api` |
| Secrets | Root `.env` (gitignored) | Build-time env; never commit secrets |

`VITE_*` values are **baked at build time**. Rebuild the client image/assets after changing the API URL.

Production flow (shared with the API):

```text
User → DuckDNS → Nginx → client-ui | admin-ui | Django API → PostgreSQL
```

## Build

```bash
docker compose exec client-ui npm run build
```

Output is Vite `dist/` (static HTML/JS/CSS). Nginx (or equivalent) serves those files and proxies `/api` (or the public API host) to Django. CORS / CSRF trusted origins on the backend must include the public client-ui origin.

Preview a production build locally:

```bash
docker compose exec client-ui npm run preview
```

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API base including `/api` (required at build) |
| `CLIENT_UI_PORT` | Local Vite listen / Compose publish port |

Backend must allow the client origin in `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`. See root [`.env.example`](../../.env.example).

## CI/CD

GitHub Actions for frontend build/test are not in the repository yet. Until CI is wired, run:

```bash
make test-client-ui
```

## Related

- [DEVELOPMENT.md](./DEVELOPMENT.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
- Backend deploy: [`backend/docs/DEPLOYMENT.md`](../../backend/docs/DEPLOYMENT.md)
