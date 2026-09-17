# Backend (Django)

ResearchHub API — **Django + DRF + PostgreSQL**. Run only via Docker (`make start`).

Domain models use **UUID primary keys**. After pulling a UUID migration reset, recreate local DB data (`make clean` then `make start`) so Postgres is empty before migrate.

## Layout

```text
backend/
├── manage.py
├── config/           # settings, urls, wsgi/asgi
├── core/             # shared permissions, admin filters, api helpers (no models)
├── users/            # api/ (auth) + admin_api/ (users/admins)
├── projects/         # api/ + admin_api/ (stats, projects) + services/selectors
├── proposals/        # api/ + admin_api/
├── experiments/      # api/ + admin_api/
├── publications/     # api/ + admin_api/
├── invitations/      # api/ + admin_api/
└── facilities/       # client + admin installations/instruments
```

Domain apps keep models and workflow `services.py` at the app root. HTTP lives under `api/` (client) and `admin_api/` (platform admin). Cross-cutting AuthZ helpers live in `core/`.

Invitation emails use Django `send_mail` + `CLIENT_UI_ORIGIN` deep links (`/?auth=login|register&token=…`). Configure `EMAIL_*` and `CLIENT_UI_ORIGIN` via env.

## Architecture

Django-first: thin views, domain logic, small `services.py` / `selectors.py` only for real workflows. No generic service/repository stack.

## Documentation style

- Short module/class docstrings and clear section markers (e.g. `# Django` / `# Third-party` / `# ResearchHub` in `INSTALLED_APPS`).
- Explain *why* / project-specific rules across **settings, models, admin, apps, Docker, Compose, UI entry** — not only settings.
- Do **not** comment every line or restate the obvious.

See `AGENTS.md`, `.cursor/rules/backend.mdc`, `docs/ARCHITECTURE.md`.
