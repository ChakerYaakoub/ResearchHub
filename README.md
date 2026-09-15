# ResearchHub

**Simplified Scientific Proposal & Experiment Management**

ResearchHub is a web application for managing scientific research projects end to end. It is inspired by synchrotron-style proposal workflows (such as SUN set), without cloning a full facility information system.

Researchers create projects, write and submit proposals, go through scientific review, schedule experiments, invite collaborators (email + in-app), and link publications to completed work.

## Workflow

```text
Create Project
      ↓
Submit Proposal
      ↓
Scientific Review
      ↓
Approved / Rejected
      ↓
Experiment
      ↓
Publication
```

## Features

- User registration and login
- Researcher and admin roles
- Scientific projects with a clear status lifecycle
- Proposals with submit / approve / reject
- Project collaboration via invitations (email + in-app; owner, editor, viewer)
- Simple mailer: Django email + SMTP (no Celery)
- Experiments and publications linked to projects
- Public informational pages (facilities, instruments, how it works)
- Researcher dashboard and admin overview
- REST API with backend authorization and IDOR protection
- Docker Compose for local development
- Automated tests and CI/CD
- Production on Google Cloud with Nginx, DuckDNS, and HTTPS
- Optional Kubernetes manifests for future deployment

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, React Router, Bootstrap |
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL |
| Email | Django + SMTP |
| Local | Docker Compose |
| Production | Google Cloud, Nginx, DuckDNS, Let's Encrypt |

### Local

```text
React + TypeScript
        |
        | REST API
        ↓
Django + DRF
        |
        ↓
PostgreSQL
```

### Production

```text
User → DuckDNS → Nginx → Django/React → PostgreSQL
```

## Project status

**Phase 4 complete** — backend Token auth (`/api/auth/register|login|logout|me`).

```text
backend/          # Django domain apps + /api/
frontend/         # React + TypeScript + Vite
nginx/            # Reverse proxy configs (Phase 17)
k8s/              # Optional Kubernetes manifests (Phase 18)
.github/workflows/# CI/CD (Phase 15)
deploy/           # Google Cloud / production helpers (Phase 17)
docker-compose.yml# Local Docker Compose
```

Next: **Phase 5** — Authorization (project IDOR / roles).

## API authentication

Private endpoints use **DRF Token** auth.

1. `POST /api/auth/register/` or `POST /api/auth/login/` with `{ "email", "password" }`
2. Response includes `{ "token", "user" }`
3. Send header: `Authorization: Token <token>`
4. `POST /api/auth/logout/` deletes the token; `GET /api/auth/me/` returns the current user

Frontend auth client lands with login/register pages (Phase 9).

## Quick start (local)

Docker is the only required host dependency. Do not install Python, Node, or PostgreSQL on the host for the official workflow.

```bash
cp .env.example .env
make start
```

Or without Make: `docker compose up --build -d`.

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173  |
| Backend  | http://localhost:8000  |
| Admin    | http://localhost:8000/admin/ |

Useful Make targets (`make help` for the full list):

```bash
make start              # up --build -d
make stop               # stop containers
make down               # stop + remove containers
make logs               # follow logs
make shell-backend      # shell into backend
make migrate            # Django migrate
make createsuperuser    # Django superuser
make clean              # down -v (destroys DB volume)
```

Environment variables are documented in `.env.example`. Do not commit real credentials.

## Security highlights

- Authentication and permissions are enforced on the backend
- Project access is limited to owners, collaborators, and admins
- Invitation tokens are secure, time-limited (7 days), and only grant access after acceptance
- Production HTTPS via Let's Encrypt behind Nginx

## License

To be defined.
