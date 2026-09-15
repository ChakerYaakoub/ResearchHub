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
| Production | Google Cloud, Nginx, DuckDNS, Let's Encrypt HTTPS |
| Optional | Kubernetes |

## UI brand (client-ui + admin-ui)

Same palette and responsive rules in **both** frontends. Use CSS tokens (override Bootstrap primary/secondary). Do not put third-party facility names in product copy.

**Bootstrap-first** in `client-ui` and `admin-ui`; add page CSS only when needed. **UI copy** lives in `src/strings/` and per-page `strings/` folders — not hard-coded in JSX.

| Token | Hex | Role |
|-------|-----|------|
| Primary / CTAs | `#B82721` | Main buttons |
| Primary hover | `#9C1A1A` | Hover / pressed |
| Accent | `#328BA0` | Links, secondary actions |
| Highlight | `#FBD600` | Sparse badges/highlights |
| Success | `#73A104` | Positive status |
| Text | `#292929` | Body |
| Muted text | `#585858` | Secondary text |
| Border | `#D5D5D5` | Dividers |
| Surface | `#FFFFFF` | Panels |
| Page background | `#EDEDED` | Muted surface |

**Responsive is mandatory** on every screen (phone → tablet → desktop; no horizontal page scroll). Full token list and usage rules live in local `docs/UI_DESIGN.md` / agent rules when developing with Cursor.

### Local

```text
client-ui :5173 | admin-ui :5175
        |
        | REST API (+ JWT)
        ↓
Django + DRF
        |
        ↓
PostgreSQL
```

### Production

```text
User → DuckDNS → Nginx → client-ui | admin-ui | Django API → PostgreSQL
```

## Project status

**Phase 9 complete** — public `client-ui` marketing pages + JWT login/register (brand tokens, responsive).  

```text
backend/          # Django domain apps + /api/
client-ui/        # Client app: marketing, login, dashboard (Vite :5173)
admin-ui/         # Admin app (Vite :5175)
nginx/            # Reverse proxy configs (Phase 17)
k8s/              # Optional Kubernetes manifests (Phase 18)
.github/workflows/# CI/CD (Phase 15)
deploy/           # Google Cloud / production helpers (Phase 17)
docker-compose.yml# Local Docker Compose
```

Next: **Phase 10** — Researcher dashboard (`client-ui`).

## API authentication

Private endpoints use **JWT** (`djangorestframework-simplejwt`).

1. `POST /api/auth/register/` or `POST /api/auth/login/` with `{ "email", "password" }`
2. Response: `{ "access", "refresh", "user" }`
3. Send header: `Authorization: Bearer <access>`
4. Refresh: `POST /api/auth/refresh/` with `{ "refresh" }`
5. Logout: `POST /api/auth/logout/` with `{ "refresh" }` (blacklists refresh); `GET /api/auth/me/` returns the current user

JWT = authentication only. Authorization uses DRF permissions + IDOR-safe querysets:

- **VIEWER+** — read project and nested resources
- **OWNER / EDITOR / ADMIN** — write proposal, experiments, publications
- **OWNER / ADMIN** — delete project; remove collaborators (not the owner)
- **ADMIN** — approve/reject + `/api/admin/stats/` **and** request Origin must be in `ADMIN_UI_ORIGINS` (admin-ui)

Tokens are per UI origin. Researchers log in on **client-ui**; admins on **admin-ui**.

## Quick start (local)

Docker is the only required host dependency. Do not install Python, Node, or PostgreSQL on the host for the official workflow.

```bash
cp .env.example .env
make start
```

Or without Make: `docker compose up --build -d`.

| Service   | URL (ports from `.env`)     |
|-----------|-----------------------------|
| Client UI | http://localhost:${CLIENT_UI_PORT} (default 5173) |
| Admin UI  | http://localhost:${ADMIN_UI_PORT} (default 5175) |
| Backend   | http://localhost:${BACKEND_PORT} (default 8000) |
| Django admin | http://localhost:8000/admin/ (container) |

Ports are set in `.env` (`CLIENT_UI_PORT`, `ADMIN_UI_PORT`, `BACKEND_PORT`). If you change a UI port, also update `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, and `ADMIN_UI_ORIGINS`.

Useful Make targets (`make help` for the full list):

```bash
make start              # up --build -d
make stop               # stop containers
make down               # stop + remove containers
make logs               # follow logs
make shell-backend      # shell into backend
make shell-client-ui    # shell into client-ui
make shell-admin-ui     # shell into admin-ui
make migrate            # Django migrate
make createsuperuser    # Django superuser
make clean              # down -v (destroys DB volume)
```

Environment variables:

- **Docker / full stack:** copy root [`.env.example`](.env.example) → `.env` (Compose uses this)
- **Per project:** [`backend/.env.example`](backend/.env.example), [`client-ui/.env.example`](client-ui/.env.example), [`admin-ui/.env.example`](admin-ui/.env.example)

Do not commit real credentials. If you change a UI port, also update `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, and `ADMIN_UI_ORIGINS`.

## Security highlights

- Authentication and permissions are enforced on the backend
- Project access is limited to owners, collaborators, and admins
- Admin API routes require admin-ui Origin (`ADMIN_UI_ORIGINS`) plus platform ADMIN role
- Invitation tokens are secure, time-limited (7 days), and only grant access after acceptance
- Production HTTPS via Let's Encrypt behind Nginx

## License

To be defined.
