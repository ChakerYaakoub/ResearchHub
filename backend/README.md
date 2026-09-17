# Backend (Django)

ResearchHub API — **Django + DRF + PostgreSQL + SimpleJWT**.

The backend powers both **client-ui** (researchers) and **admin-ui** (platform admins). It owns authentication, authorization, scientific project workflows, invitations, the facilities catalog, and email delivery. Frontends are never trusted for security.

Run only via Docker (`make start` from the repo root).

Domain models use **UUID primary keys**. After a UUID migration reset, recreate local DB data (`make clean` then `make start`) so Postgres is empty before migrate.

## Architecture overview

Django-first: thin views, domain logic, and small `services.py` / `selectors.py` only for real workflows. No generic service or repository stack.

```text
View → Permission → Serializer validation → Service → Model / ORM
```

| Layer | Role |
|-------|------|
| Views | HTTP wiring; stay thin |
| Permissions + selectors | AuthZ and IDOR-safe querysets |
| Serializers | Validation and IO shaping |
| Services | Multi-step workflows (submit, invite accept, …) |
| Models | Data, choices, DB constraints |

Details: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Main technologies

| Technology | Use |
|------------|-----|
| Django | Project, ORM, admin, email |
| Django REST Framework | REST API |
| djangorestframework-simplejwt | Access/refresh JWT + blacklist |
| PostgreSQL | Primary database |
| django-cors-headers | SPA origins |
| django-ratelimit | Public auth abuse limits |

## Folder structure

```text
backend/
├── manage.py
├── config/           # settings, urls, wsgi/asgi
├── core/             # shared permissions, validation, mail, rate limit, honeypot
├── users/            # api/ (auth) + admin_api/ (users/admins)
├── projects/         # api/ + admin_api/ (stats, projects) + services/selectors
├── proposals/        # api/ + admin_api/ + submit/approve/reject services
├── experiments/      # api/ + admin_api/ + selectors
├── publications/     # api/ + admin_api/ + selectors
├── invitations/      # api/ + admin_api/ + invitation services + email
├── facilities/       # client + admin installations/instruments
├── test_helpers.py   # shared Django test fixtures
└── docs/             # developer documentation (includes SECURITY.md)
```

Domain apps keep models and workflow `services.py` at the app root. HTTP lives under `api/` (client) and `admin_api/` (platform admin). Cross-cutting AuthZ helpers live in `core/`.

## Request lifecycle

```text
client-ui / admin-ui
        │  REST + Bearer JWT
        ▼
/api/ → view → permission → serializer (+ core.validation)
                 → selector (IDOR) → service (if workflow) → model
                 → JSON (no secrets / list tokens)
```

Admin routes also require `Origin` ∈ `ADMIN_UI_ORIGINS`.

## Authentication & authorization

- **AuthN:** JWT (`Authorization: Bearer <access>`). Register/login return access + refresh + user.
- **AuthZ:** DRF permissions + filtered querysets — not JWT claims alone.
- **Project roles:** OWNER / EDITOR / VIEWER (membership).
- **Platform roles:** SUPER_ADMIN / ADMIN / RESEARCHER.
- **Admin API:** platform ADMIN **and** admin-ui Origin.

See [`docs/AUTHENTICATION.md`](./docs/AUTHENTICATION.md) and [`docs/AUTHORIZATION.md`](./docs/AUTHORIZATION.md).

## Main business workflows

| Workflow | Summary |
|----------|---------|
| Proposal | Create while preparing → submit → admin approve/reject |
| Project status | Directed graph (DRAFT → … → COMPLETED); soft-delete on client DELETE |
| Experiments | PLANNED while preparing; EXECUTED after approve (starts IN_PROGRESS) |
| Publications | EXISTING while preparing; RESULTING when IN_PROGRESS/COMPLETED |
| Invitations | Secure token, 7-day expiry, email match; membership only on accept |

Details: [`docs/WORKFLOWS.md`](./docs/WORKFLOWS.md).

## Security

Never trust the frontends. The API enforces AuthN/AuthZ, HTML-reject validation, invitation-token rules, rate limits, and a honeypot on public auth.

- Full rules: [`docs/SECURITY.md`](./docs/SECURITY.md)
- Validation layers: [`docs/VALIDATION.md`](./docs/VALIDATION.md)

Shared sending: `core.mail.send_app_email` (plain text, `EMAIL_*` / `DEFAULT_FROM_EMAIL`). Invitation deep links use `CLIENT_UI_ORIGIN`.

## Local development

From the **repository root**:

```bash
cp .env.example .env
make start
make migrate              # if needed
make createsuperuser      # SUPER_ADMIN
make test-backend
```

| Command | Purpose |
|---------|---------|
| `make start` | Build/start Compose stack |
| `make migrate` | Run Django migrations |
| `make test-backend` | Django tests inside container |
| `make shell-backend` | Shell into backend |
| `make clean` | Down + destroy DB volume |

Env templates: root [`.env.example`](../.env.example), [`backend/.env.example`](./.env.example). Never commit real secrets.

More: [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md), [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md).

## Production / deployment

Local development uses Docker Compose. Production targets Google Cloud with Nginx, DuckDNS, and HTTPS. CI is not wired in the repository yet — run `make test-backend` locally before merging.

Overview: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

## Documentation index

| Document | Contents |
|----------|----------|
| [`docs/README.md`](./docs/README.md) | Hub index |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Apps & request lifecycle |
| [`docs/AUTHENTICATION.md`](./docs/AUTHENTICATION.md) | JWT & public auth |
| [`docs/AUTHORIZATION.md`](./docs/AUTHORIZATION.md) | RBAC, Origin, IDOR |
| [`docs/SECURITY.md`](./docs/SECURITY.md) | Security & validation |
| [`docs/VALIDATION.md`](./docs/VALIDATION.md) | Input validation |
| [`docs/WORKFLOWS.md`](./docs/WORKFLOWS.md) | Business workflows |
| [`docs/MODELS.md`](./docs/MODELS.md) | Domain models |
| [`docs/API.md`](./docs/API.md) | Endpoint map |
| [`docs/TESTING.md`](./docs/TESTING.md) | Test strategy |
| [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) | Docker & env |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Production & CI |
| [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) | Common failures |
