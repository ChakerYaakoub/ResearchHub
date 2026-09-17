# State Management

No Redux, Zustand, or React Query. State is React Context plus local React/Formik state in page and section hooks.

## Global

| Source | Holds |
|--------|-------|
| `AuthProvider` | `user`, `access`, login/register/logout |
| `AuthUiProvider` | Auth modal open state and mode |
| `localStorage` | Persisted JWT + user (`rh_*`) |
| `sessionStorage` | Invite/reset deep-link tokens |
| `notify.ts` / react-toastify | Ephemeral success/error toasts |

## When to use what

| Need | Prefer |
|------|--------|
| JWT session shared app-wide | `AuthProvider` / `useAuth()` |
| Login/register/forgot/reset modal | `AuthUiProvider` / `useAuthUi()` |
| List/detail loading, errors, mutate actions | Page or section hook (`useProjects`, `useProposalSection`, …) |
| Form values + client-side Yup | Formik in that hook |

Avoid adding a global store for server lists. There is no shared query cache — hooks refetch on mount and after mutations as implemented.

Token refresh updates access/refresh via `onAuthTokensChange` without remounting the tree.

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md) · [FORMS.md](./FORMS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
