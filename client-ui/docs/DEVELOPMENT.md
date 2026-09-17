# Local Development

Docker is the only required host dependency for the official workflow. From the **repository root**:

```bash
cp .env.example .env
make start
# or: docker compose up --build -d
```

| Service | Default URL |
|---------|-------------|
| Client UI | http://localhost:5173 (`CLIENT_UI_PORT`) |
| Backend API | http://localhost:8000/api (`VITE_API_BASE_URL`) |
| Admin UI | http://localhost:5175 |

## Make targets (client-ui)

| Target | Action |
|--------|--------|
| `make start` | `docker compose up --build -d` |
| `make stop` | Stop containers |
| `make logs` | Follow logs |
| `make shell-client-ui` | Shell into client-ui container |
| `make test-client-ui` | Vitest once |

## Environment

Compose loads the **repo-root** `.env`. Client keys are also listed in [`../.env.example`](../.env.example).

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API base including `/api` |
| `CLIENT_UI_PORT` | Vite listen / Compose publish port |

If you change the UI port, update backend `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` to match.

**Never commit** real `.env` files or production secrets.

## npm scripts (inside container)

```bash
make shell-client-ui
# then:
```

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite HMR (Compose usually runs this) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Vitest once |
| `npm run test:watch` | Vitest watch |
| `npm run lint` | Oxlint |

## Related

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) · [TESTING.md](./TESTING.md) · [DEPLOYMENT.md](./DEPLOYMENT.md)
- Client UI README: [`../README.md`](../README.md)
