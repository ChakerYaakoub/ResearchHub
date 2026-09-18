# Local Development

Docker is the only required host dependency. Do not install Python, Node, or PostgreSQL on the host for the official workflow.

## Quick start

From the **repository root**:

```bash
cp .env.example .env
make start
# or: docker compose -f docker/docker-compose.yml --project-directory . up --build -d
```

| Service      | Default URL                            |
| ------------ | -------------------------------------- |
| Backend API  | http://localhost:8000 (`BACKEND_PORT`) |
| Django admin | http://localhost:8000/admin/           |
| Client UI    | http://localhost:5173                  |
| Admin UI     | http://localhost:5175                  |
| PostgreSQL   | Compose service `postgres` (internal)  |

## Make targets

| Target                 | Action                                                                            |
| ---------------------- | --------------------------------------------------------------------------------- |
| `make start`           | `docker compose -f docker/docker-compose.yml --project-directory . up --build -d` |
| `make stop`            | Stop containers                                                                   |
| `make down`            | Stop + remove containers                                                          |
| `make logs`            | Follow logs                                                                       |
| `make shell-backend`   | Shell into backend container                                                      |
| `make migrate`         | `python manage.py migrate`                                                        |
| `make createsuperuser` | Creates SUPER_ADMIN                                                               |
| `make seed-demo`       | Demo users, facilities, project, invitation (`manage.py seed_demo`)               |
| `make test-backend`    | Django test suite                                                                 |
| `make clean`           | `down -v` — **destroys DB volume**                                                |

## Migrations

```bash
make migrate
# or
docker compose exec backend python manage.py migrate
```

After a UUID migration reset or schema-breaking pull, recreate empty local data:

```bash
make clean
make start
```

Create migrations inside the container when models change:

```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

## Environment variables

Compose loads the **repo-root** `.env`. Backend also documents keys in [`../.env.example`](../.env.example).

| Category            | Keys                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------- |
| Django              | `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`                                                  |
| Database            | `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT` |
| CORS/CSRF           | `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`                                          |
| Admin Origin        | `ADMIN_UI_ORIGINS`                                                                      |
| Email               | `EMAIL_*`, `DEFAULT_FROM_EMAIL`, `CLIENT_UI_ORIGIN`                                     |
| Rate limits         | `AUTH_RATE_LIMIT`, `PASSWORD_RESET_RATE_LIMIT`                                          |
| Ports (root `.env`) | `BACKEND_PORT`, `CLIENT_UI_PORT`, `ADMIN_UI_PORT`                                       |

If you change a UI port, update CORS, CSRF, and `ADMIN_UI_ORIGINS` to match.

**Never commit** real `.env` files or production secrets.

## Demo data

Optional local seed (users, facilities, project + proposal/experiment/publication, pending invitation):

```bash
make seed-demo
# or (Kubernetes)
make k8s-seed-demo
```

Password for all demo accounts: `TestPass123!`

## Related

- Troubleshooting: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Testing: [TESTING.md](./TESTING.md)
- Backend README: [`../README.md`](../README.md)
