# Testing

Vitest + Testing Library + jsdom. Setup: [`src/test/setup.ts`](../src/test/setup.ts) (`@testing-library/jest-dom`).

## Commands

```bash
make test-client-ui
# or inside Compose
docker compose exec client-ui npm test
```

## Layout

Tests are colocated next to the unit under test (`*.test.ts` / `*.test.tsx`). Prefer descriptive `it('…')` names.

## Coverage map

| File | What it asserts |
|------|-----------------|
| [`auth/authStorage.test.ts`](../src/auth/authStorage.test.ts) | Save / load / clear JWT + user in `localStorage` |
| [`auth/inviteTokenStorage.test.ts`](../src/auth/inviteTokenStorage.test.ts) | Invite token in `sessionStorage` |
| [`components/RequireAuth/RequireAuth.test.tsx`](../src/components/RequireAuth/RequireAuth.test.tsx) | Unauthenticated → `/` + `requestLoginModal`; authenticated → outlet |
| [`components/InviteDeepLink/useInviteDeepLink.test.ts`](../src/components/InviteDeepLink/useInviteDeepLink.test.ts) | `?auth=` login/register/reset deep links |
| [`components/auth/LoginForm/useLoginForm.test.ts`](../src/components/auth/LoginForm/useLoginForm.test.ts) | Login submit success; `ApiError` → toast |
| [`pages/ProjectsNew/useProjectsNew.test.ts`](../src/pages/ProjectsNew/useProjectsNew.test.ts) | Create project → navigate to detail |
| [`pages/Invitations/useInvitations.test.ts`](../src/pages/Invitations/useInvitations.test.ts) | List / accept / decline invitations |

## Current coverage

Focused on auth storage, the route UX gate, email deep links, and a few happy-path hooks.

## Not covered here

Most pages, API modules, and `tokenSession` refresh. Authorization and scientific workflows are tested on the backend ([`backend/docs/TESTING.md`](../../backend/docs/TESTING.md)).

## Related

- [DEVELOPMENT.md](./DEVELOPMENT.md) · [AUTHENTICATION.md](./AUTHENTICATION.md)
