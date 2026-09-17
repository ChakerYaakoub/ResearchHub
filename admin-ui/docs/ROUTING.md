# Routing

Defined in [`src/App.tsx`](../src/App.tsx).

## Public

| Path | Page |
|------|------|
| `/login` | Login |

## Protected (`RequireAuth` → `DashboardLayout`)

| Path | Page | Extra gate |
|------|------|------------|
| `/` | Dashboard | — |
| `/users` | Users | — |
| `/admins` | Admins | `RequireSuperAdmin` |
| `/projects` | Projects | — |
| `/projects/:id` | ProjectDetail | — |
| `/proposals` | Proposals | — |
| `/installations` | Installations | — |
| `/instruments` | Instruments | — |
| `/publications` | Publications | — |
| `/invitations` | Invitations | — |
| `/account` | Account | — |
| `*` | Redirect to `/` | — |

## Guards (UX only)

| Guard | Behavior |
|-------|----------|
| `RequireAuth` | No JWT session → `<Navigate to="/login" />` |
| `RequireSuperAdmin` | Not `SUPER_ADMIN` → `<Navigate to="/" />` |

These are **not** security boundaries. The API rejects unauthorized/non-admin Origin requests.

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md) · [AUTHORIZATION.md](./AUTHORIZATION.md)
