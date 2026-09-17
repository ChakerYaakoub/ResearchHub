# Testing

Vitest + Testing Library + jsdom. Setup: [`src/test/setup.ts`](../src/test/setup.ts) (`@testing-library/jest-dom`).

## Commands

```bash
make test-admin-ui
# or inside Compose
docker compose exec admin-ui npm test
```

## Layout

Tests are colocated next to the unit under test (`*.test.ts` / `*.test.tsx`). Existing tests use descriptive names.

## Coverage map

| File | What it asserts |
|------|-----------------|
| [`auth/authStorage.test.ts`](../src/auth/authStorage.test.ts) | Save / load / clear `rh_admin_*` in `localStorage` |
| [`components/RequireAuth/RequireAuth.test.tsx`](../src/components/RequireAuth/RequireAuth.test.tsx) | Unauthenticated → `/login`; authenticated → outlet |
| [`pages/Login/Login.test.tsx`](../src/pages/Login/Login.test.tsx) | Login heading and credential fields render |
| [`pages/Users/useUsers.test.ts`](../src/pages/Users/useUsers.test.ts) | Loads researchers via mocked `listResearchers` |

## Current coverage

Auth storage, route UX gate, login render, users list hook.

## Not covered here

Most pages, approve/reject, facilities CRUD, Admins SUPER_ADMIN flows, Origin allowlist. Backend tests cover AuthZ and workflows ([`backend/docs/TESTING.md`](../../backend/docs/TESTING.md)).

## Related

- [DEVELOPMENT.md](./DEVELOPMENT.md) · [AUTHENTICATION.md](./AUTHENTICATION.md) · [COPY.md](./COPY.md)
