# ResearchHub Client UI Documentation

Developer documentation for the researcher-facing React app (`client-ui`).

| Document | Contents |
|----------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Smart/dumb layout, folder structure, pages |
| [ROUTING.md](./ROUTING.md) | Public vs protected routes, deep links |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | Modal auth, JWT storage, refresh |
| [AUTHORIZATION.md](./AUTHORIZATION.md) | Membership UI gates (UX only) |
| [API.md](./API.md) | `apiFetch` and endpoint map |
| [STATE.md](./STATE.md) | Contexts, local state, toasts |
| [FORMS.md](./FORMS.md) | Formik/Yup, honeypot |
| [COMPONENTS.md](./COMPONENTS.md) | Shared UI and layouts |
| [I18N.md](./I18N.md) | English / French copy |
| [TESTING.md](./TESTING.md) | Vitest suite |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Docker, Make, env |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Build and production notes |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common failures |

Start with [`../README.md`](../README.md) for a short overview.

**Security note:** Route guards and form validation are UX only. The Django API is the authority for AuthZ and validation.
