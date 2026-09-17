# Shared Components

Named folders under `src/components/`. When a unit has logic, use `useX.ts` + `X.tsx` (smart/dumb). Markup stays in the `.tsx`; hooks own state, effects, and handlers.

`AuthModalHost` currently colocates its hook in the same `.tsx` file; other units follow the `useX.ts` + `X.tsx` split.

## Layouts and chrome

| Component | Role |
|-----------|------|
| `PublicLayout` | Marketing nav, language switcher, login/register modal triggers, outlet |
| `DashboardLayout` | Researcher sidebar, user menu, language, outlet (under `RequireAuth`) |
| `RequireAuth` | UX gate: unauthenticated → home + login modal flag. Not AuthZ. |
| `UserMenu` | Account link + logout dropdown |
| `InviteDeepLink` | Side-effect host for `?auth=` / invite / reset query params |
| `ScrollToTop` | FAB after scroll; jumps to top of window |
| `PageHeader` / `PageMeta` | Page title row and document `<title>` / meta description |
| `AuthModalHost` | Renders `AuthModal` from `AuthUi` context; consumes RequireAuth flag |

## Auth UI

| Component | Role |
|-----------|------|
| `AuthUiProvider` / `useAuthUi` | Modal open/mode only (separate from JWT `AuthProvider`) |
| `AuthModal` | Modes: login, register, forgot, reset |
| `LoginForm` / `RegisterForm` | Formik + Yup; honeypot field `company` |
| `ForgotPasswordForm` / `ResetPasswordForm` | Request reset email / set new password from deep link |
| `HoneypotField` | CSS-hidden `company` field; must stay empty for humans |
| `authSchemas` | Shared Yup schemas; messages via i18n — UX only |

Frontend validation and `RequireAuth` improve UX. The backend remains authoritative for credentials, tokens, and permissions.

## Primitives / UX states

| Component | Role |
|-----------|------|
| `LoadingState` | Spinner; optional `compact` / `overlay` |
| `EmptyState` | Empty list / no data + optional CTA |
| `Skeleton` | `SkeletonLine` / `SkeletonBlock` shimmer building blocks |
| `StatusBadge` | Status chip with tone class from known workflow statuses |
| `ConfirmDialog` | Destructive confirm built on `Popup` |
| `Popup` | Lightweight overlay; body scroll lock + Escape / backdrop close |
| `TextInput` | Formik-backed Bootstrap control with stable label/message slots |

Page-level skeletons (e.g. `DashboardSkeleton`, `ProjectDetailsSkeleton`) live next to their pages.

## Related

- [ARCHITECTURE.md](./ARCHITECTURE.md) · [ROUTING.md](./ROUTING.md) · [FORMS.md](./FORMS.md) · [AUTHENTICATION.md](./AUTHENTICATION.md)
