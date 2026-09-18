# Admin UI (platform admin app)

ResearchHub **admin-ui** — platform administrator panel for stats, researchers, admins (SUPER_ADMIN), projects, proposal review, facilities, publications, and invitations.

This README is for developers and maintainers. Stack: **React 19, TypeScript, Vite, React Router 7, Bootstrap 5, Formik, Yup, react-toastify, Vitest**. English copy via [`src/copy.ts`](./src/copy.ts) (no i18n yet).

Run via Docker from the repository root (`make start`). Official workflow does not require a host Node install.

Frontends are never trusted for security. Route guards, role checks, and form validation are **UX only**. The Django API enforces AuthZ and requires request Origin ∈ **`ADMIN_UI_ORIGINS`** for admin routes.

## Architecture overview

Named folders + smart/dumb when logic exists: `useX` (state, effects, API) + `X.tsx` (markup).

```text
BrowserRouter
  AuthProvider              # JWT session (rh_admin_*)
    Routes
      /login                # public
      RequireAuth
        DashboardLayout
          pages…
          RequireSuperAdmin → /admins
```

Details: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Folder structure

```text
admin-ui/
├── src/
│   ├── api/            # client, auth, admin, adminQuery
│   ├── auth/           # AuthProvider, token storage, refresh
│   ├── components/     # Layout, guards, filters, primitives
│   ├── hooks/          # useAdminListParams
│   ├── pages/          # Route pages
│   ├── styles/         # Brand tokens
│   ├── test/           # Vitest setup
│   ├── App.tsx
│   ├── main.tsx
│   ├── copy.ts         # English UI strings
│   └── notify.ts
└── docs/               # Developer documentation
```

## Routing

| Area | Routes |
|------|--------|
| Public | `/login` |
| Authenticated | `/`, `/users`, `/projects`, `/projects/:id`, `/proposals`, `/installations`, `/instruments`, `/publications`, `/invitations`, `/account` |
| SUPER_ADMIN only (UX) | `/admins` |

## Authentication

- Dedicated **login page** (not modal)
- JWT in `localStorage`: `rh_admin_access`, `rh_admin_refresh`, `rh_admin_user`
- Only `SUPER_ADMIN` \| `ADMIN` accepted after login (researchers rejected UX-side)
- Refresh on 401 via single-flight `ensureFreshAccess`

See [`docs/AUTHENTICATION.md`](./docs/AUTHENTICATION.md).

## Origin allowlist

Admin API calls must come from an Origin listed in backend `ADMIN_UI_ORIGINS` (typically `http://localhost:5175` locally). See [`docs/ORIGIN.md`](./docs/ORIGIN.md).

## API client

Native `fetch` through [`src/api/client.ts`](./src/api/client.ts). Domain helpers in [`api/admin.ts`](./src/api/admin.ts) and [`api/auth.ts`](./src/api/auth.ts). Map: [`docs/API.md`](./docs/API.md).

## State

React Context only (`AuthProvider`). List filters sync to the URL (`useAdminListParams`); filtering is server-side via query strings.

## Forms

Formik + Yup. Frontend validation is UX only.

## Permissions (UI)

| Role | UI |
|------|-----|
| SUPER_ADMIN | Full app including Admins |
| ADMIN | All except `/admins` |
| RESEARCHER | Cannot use admin-ui |

See [`docs/AUTHORIZATION.md`](./docs/AUTHORIZATION.md) and [`docs/WORKFLOWS.md`](./docs/WORKFLOWS.md) for privileged actions (approve/reject, deactivate, deletes, create admin).

## Testing

```bash
make test-admin-ui
```

Coverage map: [`docs/TESTING.md`](./docs/TESTING.md).

## Local development

```bash
# from repo root
cp .env.example .env
make start
make test-admin-ui
make shell-admin-ui
```

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API base including `/api` |
| `ADMIN_UI_PORT` | Vite listen port (default 5175) |
| `ADMIN_UI_ORIGINS` | Backend allowlist (must include this app Origin) |

See [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md).

## Build

```bash
docker compose exec admin-ui npm run build
docker compose exec admin-ui npm run preview
```

See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

## Documentation

| Document | Contents |
|----------|----------|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Smart/dumb layout, folder structure, pages |
| [`docs/ROUTING.md`](./docs/ROUTING.md) | `/login` and protected routes |
| [`docs/AUTHENTICATION.md`](./docs/AUTHENTICATION.md) | Page login, JWT storage, refresh |
| [`docs/AUTHORIZATION.md`](./docs/AUTHORIZATION.md) | ADMIN / SUPER_ADMIN UX gates |
| [`docs/ORIGIN.md`](./docs/ORIGIN.md) | `ADMIN_UI_ORIGINS` contract |
| [`docs/API.md`](./docs/API.md) | `apiFetch` and endpoint map |
| [`docs/STATE.md`](./docs/STATE.md) | Auth context, local state, toasts |
| [`docs/FORMS.md`](./docs/FORMS.md) | Formik/Yup; UX vs backend validation |
| [`docs/COMPONENTS.md`](./docs/COMPONENTS.md) | Shared UI, filters, guards |
| [`docs/COPY.md`](./docs/COPY.md) | English `copy.ts` (no i18n yet) |
| [`docs/WORKFLOWS.md`](./docs/WORKFLOWS.md) | Privileged and destructive actions |
| [`docs/TESTING.md`](./docs/TESTING.md) | Vitest suite |
| [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) | Docker, Make, env |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Build and production notes |
| [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) | Common failures |
