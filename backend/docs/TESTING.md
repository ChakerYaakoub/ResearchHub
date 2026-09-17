# Testing

Backend tests use Django’s `TestCase` / DRF `APIClient` inside Docker. Run:

```bash
make test-backend
# or
docker compose exec backend python manage.py test
```

## Layout

```text
backend/
├── test_helpers.py                 # shared fixtures (not a Django app)
├── core/tests/test_validation.py
├── users/tests/test_auth.py
├── projects/tests/
│   ├── test_projects_api.py
│   ├── test_idor.py
│   ├── test_models.py
│   ├── test_admin_stats.py
│   ├── test_admin_proposals.py
│   └── test_admin_panel.py
├── proposals/tests/test_workflow.py
├── invitations/tests/
│   ├── test_invitations.py
│   └── test_mailer.py
├── experiments/tests/test_api.py
├── publications/tests/test_api.py
└── facilities/tests/test_api.py
```

## Shared helpers (`test_helpers.py`)

| Helper | Purpose |
|--------|---------|
| `make_user` | Create researcher (or role override) with unique email |
| `make_admin` / `make_super_admin` | Platform admin users |
| `auth_client` | `APIClient` with Bearer JWT |
| `admin_client` | Authenticated + `ADMIN_UI_ORIGINS[0]` Origin header |
| `make_project` | Project + OWNER membership |
| `make_instrument` | ACTIVE installation + AVAILABLE instrument |
| `add_member` | Add/update project membership |

Default password constant: `DEFAULT_PASSWORD`.

## Coverage map

| Module | Happy path | Validation | AuthZ / IDOR | Security |
|--------|------------|------------|--------------|----------|
| `test_validation` | sanitize/username/code | HTML reject, charset | — | HTML rules |
| `test_auth` | register/login/me/refresh | weak password, email change | inactive user | honeypot, rate limit, reset anti-enum |
| `test_projects_api` | CRUD, collaborators | — | owner remove guard | — |
| `test_idor` | — | — | outsider 404, viewer/editor limits | admin sees all |
| `test_models` | — | uniqueness constraints | — | invitation token unique |
| `test_admin_stats` / `test_admin_proposals` | admin + Origin | — | Origin/role gate | Origin required |
| `test_admin_panel` | lists, soft/hard delete | filters | super-admin gates | email rollback on create admin |
| `test_workflow` | submit/approve/reject/complete | illegal transitions | Origin on approve | — |
| `test_invitations` | create/accept/decline/cancel | duplicate, expiry | outsider, email match | token omit on project list |
| `test_mailer` | invite email content | — | — | SMTP fail still creates invite |
| `test_api` (experiments/publications) | member write | kind gates | outsider 404 | — |
| `test_api` (facilities) | admin CRUD, researcher read | invalid status | researcher cannot admin create | delete blocked if in use |

## Coverage notes

- Core suite covers auth, AuthZ/IDOR, workflow, invitations, admin panel, and validation helpers.
- Invitation email outbox coverage lives in `invitations/tests/test_mailer.py`.
- `core/admin_filters.py` and `core/api.py` are exercised indirectly through admin API tests.
- Experiment/publication create and read AuthZ are covered more thoroughly than PATCH/DELETE.
- Admin Origin is covered on stats, proposals, and panel suites (not every `/api/admin/*` route individually).

## Related

- Development: [DEVELOPMENT.md](./DEVELOPMENT.md)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
