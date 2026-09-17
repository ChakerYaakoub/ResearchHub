# Deployment & CI/CD

## Local vs production

| Concern | Local | Production target |
|---------|-------|-------------------|
| Orchestration | Docker Compose | Static assets behind Nginx |
| URL | `http://localhost:${ADMIN_UI_PORT}` | Public admin origin |
| API base | `VITE_API_BASE_URL` | Public API including `/api` |
| Origin allowlist | `ADMIN_UI_ORIGINS=http://localhost:5175` | Exact public admin origin |

`VITE_*` values are **baked at build time**. Rebuild after changing the API URL.

```text
User → DuckDNS → Nginx → client-ui | admin-ui | Django API → PostgreSQL
```

## Build

```bash
docker compose exec admin-ui npm run build
```

Output is Vite `dist/`. Backend `ADMIN_UI_ORIGINS` must include the public admin-ui origin.

## CI/CD

GitHub Actions for frontend build/test are not in the repository yet. Until CI is wired:

```bash
make test-admin-ui
```

## Related

- [DEVELOPMENT.md](./DEVELOPMENT.md) · [ORIGIN.md](./ORIGIN.md)
- Backend: [`backend/docs/DEPLOYMENT.md`](../../backend/docs/DEPLOYMENT.md)
