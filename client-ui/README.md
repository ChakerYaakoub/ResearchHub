# Client UI (researcher app)

ResearchHub **client-ui** — marketing pages, modal authentication, and the researcher dashboard for projects, proposals, experiments, publications, and invitations.

Stack: **React 19, TypeScript, Vite, React Router 7, Bootstrap 5, Formik, Yup, i18next (en/fr), react-toastify, Vitest**.

Run via Docker from the repository root (`make start`). Official workflow does not require a host Node install.

Frontends are never trusted for security. Route guards and form validation are **UX only**; the Django API is authoritative for AuthN, AuthZ, and validation.

## Architecture overview

Named folders + smart/dumb when logic exists: `useX.ts` (state, effects, API) + `X.tsx` (markup). Pure i18n pages may be a single `.tsx`.

```text
BrowserRouter
  AuthProvider          # JWT session (localStorage)
    AuthUiProvider      # login/register/forgot/reset modal state
      InviteDeepLink
      PublicLayout | RequireAuth → DashboardLayout
      AuthModalHost
```

Details: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Folder structure

```text
client-ui/
├── src/
│   ├── api/            # REST wrappers (apiFetch + domain modules)
│   ├── auth/           # AuthProvider, token storage, auth API, refresh
│   ├── components/     # Layouts, auth forms, shared primitives
│   ├── i18n/           # en/fr locales
│   ├── pages/          # Route pages
│   ├── styles/         # Brand tokens (Bootstrap overrides)
│   ├── test/           # Vitest setup
│   ├── types/          # Shared API TypeScript types
│   ├── App.tsx         # Routes + providers
│   ├── main.tsx
│   └── notify.ts       # Toast helpers
└── docs/               # Developer documentation
```

## Routing

| Area | Routes |
|------|--------|
| Public | `/`, `/how-it-works`, `/documentation` |
| Authenticated (UX gate) | `/dashboard`, `/projects`, `/projects/new`, `/projects/:id`, `/invitations`, `/account` |

There are **no** `/login` or `/register` routes — auth is modal-only. `RequireAuth` redirects home and opens the login modal. Deep links: `?auth=login|register|reset` (see [`docs/ROUTING.md`](./docs/ROUTING.md)).

## Authentication

- JWT access + refresh in `localStorage` (`rh_access`, `rh_refresh`, `rh_user`)
- Login / register / logout / refresh via `AuthProvider` + `authApi`
- Password reset via email deep link → reset modal
- Invite email deep link stores token → `/invitations` after auth

See [`docs/AUTHENTICATION.md`](./docs/AUTHENTICATION.md).

## API client

Native `fetch` through [`src/api/client.ts`](./src/api/client.ts) (`apiFetch`). Access token is passed explicitly from `useAuth()`. On 401, a single-flight refresh retries once.

Domain modules: projects, proposals, experiments, publications, invitations, facilities. Map: [`docs/API.md`](./docs/API.md).

## State

React Context only (`AuthProvider`, `AuthUiProvider`). No Redux, Zustand, or React Query. Page hooks hold local/Formik state; toasts via `notify.ts`.

## Forms

Formik + Yup for auth and most mutate forms. Honeypot field name: `company` (must stay empty). Frontend validation is UX only.

## Permissions (UI)

`canEdit` / `isOwner` and status/kind gates on Project Details hide actions. Backend AuthZ remains authoritative. See [`docs/AUTHORIZATION.md`](./docs/AUTHORIZATION.md).

Platform `user.role` is stored but not used for client-ui routing (researcher app).

## i18n

English and French in `src/i18n/locales/{en,fr}.json`. Preference key: `rh_lang`. Copy via `t('…')`.

## Testing

```bash
make test-client-ui
```

Coverage map: [`docs/TESTING.md`](./docs/TESTING.md).

## Local development

```bash
# from repo root
cp .env.example .env
make start
make test-client-ui
make shell-client-ui
```

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API base including `/api` |
| `CLIENT_UI_PORT` | Vite listen port (default 5173) |

See [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) and [`../.env.example`](../.env.example).

## Build

```bash
docker compose exec client-ui npm run build
docker compose exec client-ui npm run preview
```

See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for local vs production notes and CI status.

## Documentation

| Doc | Purpose |
|-----|---------|
| [`docs/`](./docs/) | Full hub (architecture, auth, API, forms, testing, …) |
| [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) | Common local failures |
