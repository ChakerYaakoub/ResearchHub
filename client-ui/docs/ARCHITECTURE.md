# Architecture

ResearchHub **client-ui** is the researcher SPA: marketing pages, modal authentication, and a project dashboard. Stack: **React 19, TypeScript, Vite, React Router 7, Bootstrap 5, Formik, Yup, i18next**.

## Design principle

Named folders + **smart/dumb** split when logic exists:

```text
pages/Foo/ or components/Foo/
  useFoo.ts    # state, effects, handlers, API — no JSX
  Foo.tsx      # markup only; calls useFoo(props)
  Foo.css      # only when Bootstrap is not enough
  index.ts     # re-export
```

Pure presentational pages that only call `t()` may be a single `.tsx` in their folder (e.g. HowItWorks, Documentation).

## Folder structure

```text
client-ui/src/
├── api/           # REST fetch wrappers (projects, proposals, …)
├── auth/          # AuthProvider, token storage, auth API, refresh
├── components/    # Shared UI (layouts, auth forms, primitives)
├── i18n/          # en/fr locales
├── pages/         # Route pages
├── styles/        # Brand tokens (Bootstrap overrides)
├── test/          # Vitest setup
├── types/         # Shared API TypeScript types
├── App.tsx        # Routes + providers
├── main.tsx       # Bootstrap, router, toasts
└── notify.ts      # Toast helpers
```

## UI flow

```text
BrowserRouter
  AuthProvider
    AuthUiProvider
      InviteDeepLink          # ?auth=&token= deep links
      Routes
        PublicLayout          # marketing
        RequireAuth           # UX gate → login modal + redirect /
          DashboardLayout     # researcher shell
      AuthModalHost           # login/register/forgot/reset modal
```

## Related

- [ROUTING.md](./ROUTING.md) · [AUTHENTICATION.md](./AUTHENTICATION.md) · [AUTHORIZATION.md](./AUTHORIZATION.md) · [API.md](./API.md)

## Pages (route → responsibility)

| Route | Page | Data / actions |
|-------|------|----------------|
| `/` | Home | Marketing i18n; open register modal |
| `/how-it-works` | HowItWorks | Static i18n only |
| `/documentation` | Documentation | Static i18n only |
| `/dashboard` | Dashboard | Counts from projects, invitations, experiments, publications |
| `/projects` | Projects | List projects |
| `/projects/new` | ProjectsNew | Create project |
| `/projects/:id` | ProjectDetails | Detail + sections (proposal, experiments, publications, team, submit) |
| `/invitations` | Invitations | Accept / decline |
| `/account` | Account | Profile, password, reset-email request |

Auth is modal-only — there are no routed login/register pages.
