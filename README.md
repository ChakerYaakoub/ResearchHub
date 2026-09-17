# ResearchHub

**Simplified Scientific Proposal & Experiment Management**

ResearchHub is a web application for managing scientific research projects end to end. It is inspired by synchrotron-style proposal workflows (such as SUN set), without cloning a full facility information system.

Researchers create projects, write and submit proposals, go through scientific review, schedule experiments, invite collaborators (email + in-app), and link publications to completed work. Platform admins review proposals and manage users, facilities, and catalog data from a separate admin app.

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

## Features (shipped)

- User registration and login (JWT; separate origins for researcher and admin apps)
- Researcher and platform admin roles
- Scientific projects with a clear status lifecycle
- Proposals with submit / approve / reject
- Project collaboration via invitations (email + in-app; owner, editor, viewer)
- Mailer: Django email + SMTP (no Celery)
- Experiments and publications linked to projects
- Public informational pages and researcher dashboard (`client-ui`)
- Admin overview, users, facilities, and review tools (`admin-ui`)
- REST API with backend authorization and IDOR protection
- Docker Compose for local development
- Automated backend and frontend test suites (run via Make / Docker)

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, React Router, Bootstrap (`client-ui` + `admin-ui`) |
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL |
| Email | Django + SMTP |
| Local | Docker Compose |
| Production (planned) | Google Cloud, Nginx, DuckDNS, Let's Encrypt HTTPS |
| Optional (later) | Kubernetes |

## Architecture

### Current (local / Docker Compose)

What you run today with `make start`:

```text
client-ui (:5173) ──┐
admin-ui  (:5175) ──┼── REST + JWT ──► Django + DRF ──► PostgreSQL
                    │                  (+ SMTP mailer)
                    └── CORS / CSRF
                        ADMIN_UI_ORIGINS (admin API)
```

- **client-ui** — researcher SPA (marketing + dashboard); JWT in `localStorage` (`rh_*`); modal auth.
- **admin-ui** — platform admin SPA; JWT in `rh_admin_*`; page login; Origin must be in `ADMIN_UI_ORIGINS` for admin routes.
- **backend** — system of record for AuthN, AuthZ, workflows, and validation. Frontends are never trusted for security.

### Target production (Phase 17)

Design goal after CI/CD:

```text
User → DuckDNS → Nginx (TLS / Let's Encrypt)
                    ├── client-ui (static)
                    ├── admin-ui  (static)
                    └── Django API → PostgreSQL
                         (+ SMTP)
```

Folders reserved for this work: `nginx/`, `deploy/`. Env for domain, TLS, and SMTP stays out of git.

### Optional later (Phase 18)

Kubernetes manifests under `k8s/` after a working Docker VM + Nginx MVP. Kubernetes is last and optional.

## Progress / roadmap

| Phase | Focus | Status |
|------:|-------|--------|
| 0–14 | Foundation → mailer (API, AuthZ, both UIs, tests, email) | done |
| 15 | Documentation polish | done |
| 16 | CI/CD | next |
| 17 | Google Cloud + Nginx + DuckDNS + HTTPS | todo |
| 18 | Kubernetes (optional) | todo |

```text
done:  0 → 15
next:  16 CI/CD
todo:  17 GCP/Nginx/HTTPS → 18 k8s
```


## Documentation

| Area | Entry | Deep docs |
|------|-------|-----------|
| Backend | [`backend/README.md`](backend/README.md) | [`backend/docs/`](backend/docs/) |
| Client UI | [`client-ui/README.md`](client-ui/README.md) | [`client-ui/docs/`](client-ui/docs/) |
| Admin UI | [`admin-ui/README.md`](admin-ui/README.md) | [`admin-ui/docs/`](admin-ui/docs/) |

Security & validation (backend): [`backend/docs/SECURITY.md`](backend/docs/SECURITY.md).

## Project layout

```text
backend/           # Django domain apps + /api/ + docs/
client-ui/         # Researcher SPA (Vite) + docs/
admin-ui/          # Platform admin SPA (Vite) + docs/
nginx/             # Reverse proxy configs (Phase 17)
deploy/            # Google Cloud / production helpers (Phase 17)
k8s/               # Optional Kubernetes manifests (Phase 18)
.github/workflows/ # CI/CD (Phase 16)
docker-compose.yml # Local Docker Compose
```

## Backend

Django + DRF + PostgreSQL + SimpleJWT. Owns users, projects, proposals, experiments, publications, invitations, facilities, and email. Project roles: OWNER / EDITOR / VIEWER. Platform roles: SUPER_ADMIN / ADMIN / RESEARCHER. Admin API routes require platform ADMIN **and** Origin ∈ `ADMIN_UI_ORIGINS`.

```bash
make start
make migrate
make test-backend
make shell-backend
```

→ [`backend/README.md`](backend/README.md) · [`backend/docs/`](backend/docs/)

## Client UI

Researcher SPA: public marketing, **modal-only** auth, dashboard for projects / proposals / experiments / publications / invitations. Route guards and Yup validation are UX only.

```bash
make start
make test-client-ui
make shell-client-ui
```

→ [`client-ui/README.md`](client-ui/README.md) · [`client-ui/docs/`](client-ui/docs/)

## Admin UI

Platform admin SPA: `/login`, stats, researchers, SUPER_ADMIN-managed admins, projects, proposal approve/reject, facilities CRUD, publications (read), invitations. Origin ∈ `ADMIN_UI_ORIGINS` required for admin API calls.

```bash
make start
make test-admin-ui
make shell-admin-ui
```

→ [`admin-ui/README.md`](admin-ui/README.md) · [`admin-ui/docs/`](admin-ui/docs/)

## UI brand (client-ui + admin-ui)

Same palette and responsive rules in **both** frontends. Bootstrap-first; page CSS only when needed. **client-ui** copy is i18next **en/fr**. **admin-ui** uses English `copy.ts` (no i18n yet). Do not put third-party facility names in product copy.

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

Responsive is mandatory on every screen (phone → tablet → desktop; no horizontal page scroll).

## API authentication

Private endpoints use **JWT** (`djangorestframework-simplejwt`).

1. `POST /api/auth/register/` or `POST /api/auth/login/` with `{ "email", "password" }`
2. Response: `{ "access", "refresh", "user" }`
3. Header: `Authorization: Bearer <access>`
4. Refresh: `POST /api/auth/refresh/` with `{ "refresh" }`
5. Logout: `POST /api/auth/logout/` with `{ "refresh" }` (blacklists refresh); `GET /api/auth/me/` returns the current user

JWT = authentication only. Authorization uses DRF permissions + IDOR-safe querysets:

- **VIEWER+** — read project and nested resources
- **OWNER / EDITOR / ADMIN** — write proposal, experiments, publications
- **OWNER / ADMIN** — delete project; remove collaborators (not the owner)
- **ADMIN** — approve/reject + `/api/admin/*` **and** Origin ∈ `ADMIN_UI_ORIGINS` (admin-ui)

Tokens are per UI origin. Researchers use **client-ui**; admins use **admin-ui**.

## Quick start (local)

Docker is the only required host dependency. Do not install Python, Node, or PostgreSQL on the host for the official workflow.

```bash
cp .env.example .env
make start
```

Or without Make: `docker compose up --build -d`.

| Service | URL (ports from `.env`) |
|---------|-------------------------|
| Client UI | http://localhost:${CLIENT_UI_PORT} (default 5173) |
| Admin UI | http://localhost:${ADMIN_UI_PORT} (default 5175) |
| Backend | http://localhost:${BACKEND_PORT} (default 8000) |
| Django admin | http://localhost:8000/admin/ (container) |

If you change a UI port, also update `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, and `ADMIN_UI_ORIGINS`.

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
make createsuperuser    # Django superuser (sets platform role=SUPER_ADMIN)
make test-backend       # Django tests
make test-client-ui     # client-ui Vitest
make test-admin-ui      # admin-ui Vitest
make clean              # down -v (destroys DB volume)
```

Environment variables:

- **Docker / full stack:** copy root [`.env.example`](.env.example) → `.env` (Compose uses this)
- **Per project:** [`backend/.env.example`](backend/.env.example), [`client-ui/.env.example`](client-ui/.env.example), [`admin-ui/.env.example`](admin-ui/.env.example)

Never commit real credentials or production secrets.

## Security highlights

- Authentication and permissions are enforced on the backend
- Project access is limited to owners, collaborators, and admins
- Admin API routes require admin-ui Origin (`ADMIN_UI_ORIGINS`) plus platform ADMIN role
- Invitation tokens are secure, time-limited (7 days), and only grant access after acceptance
- Production HTTPS via Let's Encrypt behind Nginx (target architecture)

## License

To be defined.
