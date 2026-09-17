# Local Development

Docker is the official workflow. From the **repository root**:

```bash
cp .env.example .env
make start
make test-admin-ui
make shell-admin-ui
```

| Service | Default URL |
|---------|-------------|
| Admin UI | http://localhost:5175 (`ADMIN_UI_PORT`) |
| Backend API | `VITE_API_BASE_URL` → http://localhost:8000/api |

## Make targets

| Target | Action |
|--------|--------|
| `make start` | Compose up |
| `make shell-admin-ui` | Shell into admin-ui |
| `make test-admin-ui` | Vitest once |

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API base including `/api` |
| `ADMIN_UI_PORT` | Vite listen / Compose publish |
| `ADMIN_UI_ORIGINS` | Backend allowlist (must include this app Origin) |

If you change the UI port, update CORS, CSRF, and `ADMIN_UI_ORIGINS`.

**Never commit** real `.env` files or production secrets.

## npm scripts (inside container)

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm test` | Vitest once |
| `npm run lint` | Oxlint |

## Related

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) · [ORIGIN.md](./ORIGIN.md) · [DEPLOYMENT.md](./DEPLOYMENT.md)
