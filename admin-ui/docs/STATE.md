# State Management

No Redux, Zustand, or React Query. State is React Context plus local React/Formik state in page hooks.

## Global

| Source | Holds |
|--------|-------|
| `AuthProvider` | `user`, `access`, `isSuperAdmin`, login/logout |
| `localStorage` | Persisted JWT + user (`rh_admin_*`) |
| `notify.ts` / react-toastify | Ephemeral success/error toasts |

## When to use what

| Need | Prefer |
|------|--------|
| JWT session | `useAuth()` |
| List filters in the URL | `useAdminListParams` |
| List/detail loading and mutations | Page hook |
| Form values + Yup | Formik in that hook |

No shared query cache — hooks refetch on mount and after mutations as implemented. Token refresh updates access/refresh via `onAuthTokensChange`.

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md) · [FORMS.md](./FORMS.md)
