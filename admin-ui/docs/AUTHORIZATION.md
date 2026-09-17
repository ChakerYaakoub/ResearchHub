# Authorization (UI permissions)

admin-ui shows or hides routes and actions based on platform role. **This is UX only.** The backend enforces AuthZ and requires Origin ∈ `ADMIN_UI_ORIGINS` for admin API routes.

## Platform roles

| Role | UI access |
|------|-----------|
| `SUPER_ADMIN` | Full admin-ui, including `/admins` |
| `ADMIN` | Admin-ui except Admins page/nav |
| `RESEARCHER` | Cannot use admin-ui (login rejected UX-side) |

`isPlatformAdminRole` = `SUPER_ADMIN` \| `ADMIN` ([`authStorage.ts`](../src/auth/authStorage.ts)).

`isSuperAdmin` = `user.role === 'SUPER_ADMIN'` ([`AuthContext`](../src/auth/AuthContext.tsx)).

## Where checked

| Check | Location |
|-------|----------|
| Login allowed | `AuthContext.login` + initial `loadStoredAuth` |
| Authenticated routes | `RequireAuth` |
| `/admins` + nav link | `RequireSuperAdmin` / `useDashboardLayout` |
| Deactivate self | Hidden on Users / Admins |
| Deactivate `SUPER_ADMIN` | Blocked in Admins hook/UI |

## Backend correspondence

Platform ADMIN (and SUPER_ADMIN) may call `/api/admin/*` and proposal approve/reject when Origin is allowed. SUPER_ADMIN-only operations (e.g. create admin) are enforced on the API even if a non–super-admin somehow hits the route.

Hiding a button is never sufficient authorization.

## Related

- [ORIGIN.md](./ORIGIN.md) · [WORKFLOWS.md](./WORKFLOWS.md) · Backend: [`backend/docs/AUTHORIZATION.md`](../../backend/docs/AUTHORIZATION.md)
