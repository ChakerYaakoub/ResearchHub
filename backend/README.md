# Backend (Django)

ResearchHub API — **Django + DRF + PostgreSQL**. Run only via Docker (`make start`).

## Layout

```text
backend/
├── manage.py
├── config/           # settings, urls, wsgi/asgi
├── users/
├── projects/
├── proposals/
├── experiments/
├── publications/
└── invitations/
```

## Architecture

Django-first: thin views, domain logic, small `services.py` / `selectors.py` only for real workflows. No generic service/repository stack.

## Documentation style

- Short module/class docstrings and clear section markers (e.g. `# Django` / `# Third-party` / `# ResearchHub` in `INSTALLED_APPS`).
- Explain *why* / project-specific rules across **settings, models, admin, apps, Docker, Compose, UI entry** — not only settings.
- Do **not** comment every line or restate the obvious.

See `AGENTS.md`, `.cursor/rules/backend.mdc`, `docs/ARCHITECTURE.md`.
