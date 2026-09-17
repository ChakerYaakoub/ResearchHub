# ResearchHub Admin UI Documentation

Documentation for developers, maintainers, and contributors working on the platform admin React app (`admin-ui`).

| Document | Contents |
|----------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Smart/dumb layout, folder structure, pages |
| [ROUTING.md](./ROUTING.md) | `/login` and protected routes |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | Page login, JWT storage, refresh |
| [AUTHORIZATION.md](./AUTHORIZATION.md) | ADMIN / SUPER_ADMIN UX gates |
| [ORIGIN.md](./ORIGIN.md) | `ADMIN_UI_ORIGINS` contract |
| [API.md](./API.md) | `apiFetch` and endpoint map |
| [STATE.md](./STATE.md) | Auth context, local state, toasts |
| [FORMS.md](./FORMS.md) | Formik/Yup; UX vs backend validation |
| [COMPONENTS.md](./COMPONENTS.md) | Shared UI, filters, guards |
| [COPY.md](./COPY.md) | English `copy.ts` (no i18n yet) |
| [WORKFLOWS.md](./WORKFLOWS.md) | Privileged and destructive actions |
| [TESTING.md](./TESTING.md) | Vitest suite |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Docker, Make, env |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Build and production notes |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common failures |

Start with [`../README.md`](../README.md) for a short overview.

**Security note:** Route guards, role checks, and form validation are UX only. The Django API enforces AuthZ and requires request Origin ∈ `ADMIN_UI_ORIGINS` for admin routes.
