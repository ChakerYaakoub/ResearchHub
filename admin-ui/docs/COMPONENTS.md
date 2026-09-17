# Shared Components

Named folders under `src/components/`. When a unit has logic, use `useX` + `X.tsx`.

## Layouts and guards

| Component | Role |
|-----------|------|
| `DashboardLayout` | Sidebar, nav (Admins link SUPER_ADMIN-only), outlet |
| `RequireAuth` | UX gate → `/login` when unauthenticated |
| `RequireSuperAdmin` | UX gate → `/` when not SUPER_ADMIN |
| `UserMenu` | Account + logout |
| `DocumentTitle` | Sets `document.title` |

## Lists

| Component / hook | Role |
|------------------|------|
| `AdminListFilters` | Search + select filters UI |
| `useAdminListParams` | URL search params; debounced search → API query |

Filtering/search run on the **backend** via query strings built with `adminQuery`.

## Primitives

| Component | Role |
|-----------|------|
| `LoadingState` / `EmptyState` | Loading and empty lists |
| `StatusBadge` | Status/role chip |
| `ConfirmDialog` | Confirm/cancel (destructive & reviews) |
| `Popup` | Modal overlay |
| `TextInput` / `PasswordField` | Form controls |

## Related

- [ROUTING.md](./ROUTING.md) · [FORMS.md](./FORMS.md) · [AUTHORIZATION.md](./AUTHORIZATION.md)
