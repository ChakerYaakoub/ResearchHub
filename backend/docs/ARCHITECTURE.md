# Backend Architecture

ResearchHub’s API is a single Django project with domain apps. Stack: **Python, Django, Django REST Framework, PostgreSQL, SimpleJWT**.

## Design principle

**Django-first:** thin views, domain-owned logic, small `services.py` / `selectors.py` only for real workflows.

```text
View → Permission → Serializer validation → Service → Model / ORM
```

- **Models** — data, choices, DB constraints, simple helpers.
- **Serializers** — input/output shaping and field validation.
- **Permissions + selectors** — AuthZ and IDOR-safe querysets.
- **Services** — multi-step workflows (submit/approve/reject, invitations, status transitions).
- **Views** — wire HTTP to the layers above; stay thin.

Simple CRUD stays in views and serializers. There is no repository layer, generic service class hierarchy, or DTO stack.

## Folder structure

```text
backend/
├── manage.py
├── config/              # settings, root urls, wsgi/asgi
├── core/                # permissions, validation, mail, rate limit, honeypot (no models)
├── users/               # auth API + admin user management
├── projects/            # projects, memberships, stats, lifecycle services/selectors
├── proposals/           # proposal CRUD + submit/approve/reject
├── experiments/         # experiments nested under projects
├── publications/        # publications nested under projects
├── invitations/         # invite create/accept/decline/cancel + email
├── facilities/          # installations & instruments (flat views layout)
├── test_helpers.py      # shared Django test fixtures
└── docs/                # this documentation hub (includes SECURITY.md)
```

Domain apps keep models (and workflow `services.py` / `selectors.py` when needed) at the app root. HTTP lives under:

- `api/` — client-ui (researcher) routes
- `admin_api/` — admin-ui (platform admin) routes

**Exception:** `facilities/` uses flat `views.py` / `serializers.py` (researcher read + admin CRUD in one module).

There is no `catalog` app in `INSTALLED_APPS`.

## Application responsibilities

| App | Responsibility |
|-----|----------------|
| `config` | Django project settings, URL aggregation, WSGI/ASGI |
| `core` | Shared AuthZ, validation helpers, mail, rate limit, honeypot, admin list filters |
| `users` | Custom `User` (email login, global role), JWT auth endpoints, admin user CRUD |
| `projects` | `ResearchProject`, memberships, visibility selectors, lifecycle transitions, admin stats |
| `proposals` | One proposal per project; submit / approve / reject services |
| `experiments` | Project experiments; kind gates (PLANNED / EXECUTED); visibility selectors |
| `publications` | Project publications; kind gates (EXISTING / RESULTING); visibility selectors |
| `invitations` | Email invitations, secure tokens, accept/decline, invitation emails |
| `facilities` | Installation/instrument catalog; public read filters; admin CRUD |

## Request lifecycle

```text
client-ui / admin-ui
        │  REST + JWT (Bearer)
        ▼
config.api_urls  →  app urls  →  View / ViewSet
        │
        ├─► DRF authentication (JWT; Session for browsable API only)
        ├─► Permission classes (core.permissions + IsAuthenticated)
        ├─► Serializer validation (+ core.validation helpers)
        ├─► Selectors / filtered querysets (IDOR)
        ├─► Services (workflows) when non-CRUD
        └─► Model / ORM  →  JSON response (no secrets / invitation tokens on list APIs)
```

Admin routes additionally require `IsPlatformAdmin` **and** `IsAdminUiOrigin` (`Origin` ∈ `ADMIN_UI_ORIGINS`).

## Cross-cutting modules (`core/`)

| Module | Role |
|--------|------|
| `permissions.py` | Project membership / editor / owner; platform admin; admin UI Origin |
| `validation.py` | Plain-text / HTML reject, username, person name, code, title helpers |
| `api.py` | Consistent API error response helper |
| `mail.py` | `send_app_email` — plain-text SMTP/console send |
| `ratelimit.py` | Public auth rate-limit decorator helpers |
| `honeypot.py` | Silent ignore when honeypot field `company` is filled |
| `admin_filters.py` | Shared admin list query helpers (search/status) |

## Related docs

- Security: [SECURITY.md](./SECURITY.md)
- Auth: [AUTHENTICATION.md](./AUTHENTICATION.md) · AuthZ: [AUTHORIZATION.md](./AUTHORIZATION.md)
