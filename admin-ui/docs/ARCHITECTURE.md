# Architecture

ResearchHub **admin-ui** is the platform admin SPA: login, stats dashboard, user/admin management, projects, proposals (approve/reject), facilities, publications, and invitations. Stack: **React 19, TypeScript, Vite, React Router 7, Bootstrap 5, Formik, Yup**.

English copy lives in [`src/copy.ts`](../src/copy.ts) (no i18n yet).

## Design principle

Named folders + **smart/dumb** split when logic exists:

```text
pages/Foo/ or components/Foo/
  useFoo.ts(x)  # state, effects, handlers, API — no JSX
  Foo.tsx       # markup only; calls the hook
  index.ts      # re-export
```

## Folder structure

```text
admin-ui/src/
├── api/           # client, auth, admin, adminQuery
├── auth/          # AuthProvider, token storage, refresh
├── components/    # Layout, guards, filters, primitives
├── hooks/         # useAdminListParams
├── pages/         # Route pages
├── styles/        # Brand tokens + list styles
├── test/          # Vitest setup
├── App.tsx        # Routes
├── main.tsx       # Router, AuthProvider, toasts
├── copy.ts        # English UI strings
└── notify.ts      # Toast helpers
```

## UI flow

```text
BrowserRouter
  AuthProvider
    Routes
      /login                    # public
      RequireAuth
        DashboardLayout
          pages…
          RequireSuperAdmin → /admins
```

Admin API calls also require browser Origin ∈ backend `ADMIN_UI_ORIGINS` — see [ORIGIN.md](./ORIGIN.md).

## Pages (route → responsibility)

| Route | Page | Data / actions |
|-------|------|----------------|
| `/login` | Login | Platform-admin sign-in |
| `/` | Dashboard | Stats + pending proposal queue |
| `/users` | Users | Researchers; activate/deactivate |
| `/admins` | Admins | SUPER_ADMIN: list/create/deactivate admins |
| `/projects` | Projects | Filterable project list |
| `/projects/:id` | ProjectDetail | Nested resources + hard delete |
| `/proposals` | Proposals | List/filter; approve/reject |
| `/installations` | Installations | CRUD |
| `/instruments` | Instruments | CRUD |
| `/publications` | Publications | List + detail popup (read-only) |
| `/invitations` | Invitations | List; revoke pending |
| `/account` | Account | Profile, password, reset-email request |

## Related

- [ROUTING.md](./ROUTING.md) · [AUTHENTICATION.md](./AUTHENTICATION.md) · [API.md](./API.md) · [WORKFLOWS.md](./WORKFLOWS.md)
