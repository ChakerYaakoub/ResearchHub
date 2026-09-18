# Docker Compose (local development)

Day-to-day ResearchHub stack: PostgreSQL, Django API, **client-ui**, and **admin-ui**.

Prefer **Make** from the repo root. Compose uses this file with `--project-directory .` so paths and `.env` resolve from the repository root.

## Quick start

```powershell
cp .env.example .env
make start
```

Equivalent without Make:

```powershell
docker compose -f docker/docker-compose.yml --project-directory . up --build -d
```

| URL | Service |
| --- | ------- |
| http://localhost:5173 | client-ui |
| http://localhost:5175 | admin-ui |
| http://localhost:8000/api | backend |
| localhost:`DATABASE_PORT` | postgres (default 5432) |

Create a platform super admin:

```powershell
make createsuperuser
```

## Services

| Service | Image / build | Role | Host port (from `.env`) |
| ------- | ------------- | ---- | ----------------------- |
| `postgres` | `postgres:16-alpine` | Primary DB | `DATABASE_PORT` → 5432 |
| `backend` | `./backend` | Django REST + JWT + mailer | `BACKEND_PORT` → 8000 |
| `client-ui` | `./client-ui` | Researcher SPA (Vite) | `CLIENT_UI_PORT` |
| `admin-ui` | `./admin-ui` | Platform admin SPA (Vite) | `ADMIN_UI_PORT` |

- Backend waits until postgres is **healthy** (`pg_isready`).
- UIs `depends_on` backend (start order only — not a readiness gate).
- Bind mounts: `./backend`, `./client-ui`, `./admin-ui` → live reload while coding.
- Named volumes for `node_modules` (client + admin) so host OS does not overwrite container deps.
- `postgres_data` keeps the DB across `make stop`; wipe with `make clean` (`down -v`).

## Env

Root **`.env`** is the source of truth (`env_file: .env` on every service).

| Variable | Used by |
| -------- | ------- |
| `DATABASE_*` | postgres + backend |
| `BACKEND_PORT` / `CLIENT_UI_PORT` / `ADMIN_UI_PORT` | published ports + Vite listen |
| `VITE_API_BASE_URL` | client-ui + admin-ui |
| `ADMIN_UI_ORIGINS` / CORS / CSRF | backend (must match UI origins) |

Template: [`.env.example`](../.env.example). Never commit real secrets.

## Useful commands

```powershell
make start              # up --build -d
make stop               # stop containers (keeps volumes)
make down               # remove containers (keeps volumes)
make clean              # down -v — DESTROYS DB + node_modules volumes
make status
make logs
make migrate
make createsuperuser
make test-backend
make shell-backend
make shell-client-ui
make shell-admin-ui
```

If the same ports are used by local Kubernetes, pause or delete k8s first (`make k8s-stop` or `make k8s-delete`).

## Layout

```text
docker/
  docker-compose.yml   # this stack
  README.md
```

## Related

- Local Kubernetes (alternate runner): [`../k8s/README.md`](../k8s/README.md)
- Root overview: [`../README.md`](../README.md)
- App READMEs: [`../backend/README.md`](../backend/README.md) · [`../client-ui/README.md`](../client-ui/README.md) · [`../admin-ui/README.md`](../admin-ui/README.md)
