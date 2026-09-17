# API Layer

Native `fetch` via `apiFetch` in [`src/api/client.ts`](../src/api/client.ts). Base URL: `VITE_API_BASE_URL` (must include `/api`).

Callers pass `token` from `useAuth().access`. On **401**, `ensureFreshAccess()` runs once, then the request retries.

Errors throw `ApiError`. `formatApiError` maps DRF messages for toasts.

## Auth (`src/api/auth.ts`)

See [AUTHENTICATION.md](./AUTHENTICATION.md).

## Admin stats & users (`src/api/admin.ts`)

| Function | Method | Path |
|----------|--------|------|
| `getAdminStats` | GET | `/admin/stats/` |
| `listResearchers` | GET | `/admin/users/?role=RESEARCHER…` |
| `listAdmins` | GET | `/admin/admins/…` |
| `createAdmin` | POST | `/admin/users/` |
| `patchUser` | PATCH | `/admin/users/{id}/` |

## Projects

| Function | Method | Path |
|----------|--------|------|
| `listProjects` | GET | `/admin/projects/…` |
| `getProject` | GET | `/admin/projects/{id}/` |
| `deleteProject` | DELETE | `/admin/projects/{id}/` |

## Proposals

| Function | Method | Path |
|----------|--------|------|
| `listProposals` | GET | `/admin/proposals/…` |
| `listPendingProposals` | GET | `/admin/proposals/?queue=review` |
| `approveProposal` | POST | `/proposals/{id}/approve/` |
| `rejectProposal` | POST | `/proposals/{id}/reject/` |

Approve/reject body: `{ review_comment }`. Require admin Origin + role on the backend.

## Facilities

| Function | Method | Path |
|----------|--------|------|
| `listInstallations` / `createInstallation` / `patchInstallation` / `deleteInstallation` | GET/POST/PATCH/DELETE | `/admin/installations/…` |
| `listAdminInstruments` / `createInstrument` / `patchInstrument` / `deleteInstrument` | GET/POST/PATCH/DELETE | `/admin/instruments/…` |

## Publications & invitations

| Function | Method | Path |
|----------|--------|------|
| `listPublications` | GET | `/admin/publications/…` |
| `listInvitations` | GET | `/admin/invitations/…` |
| `cancelInvitation` | DELETE | `/admin/invitations/{id}/` |

## Query helpers (`adminQuery.ts`)

`adminQuery(params)` builds `?key=value` from defined non-empty values. List param types: users, projects, proposals, invitations, publications, installations, instruments.

List filters also sync to the URL via `useAdminListParams` — filtering is **server-side** through these query strings.

## Related

- Types: live in [`src/api/admin.ts`](../src/api/admin.ts) and [`authStorage.ts`](../src/auth/authStorage.ts)
- Backend map: [`backend/docs/API.md`](../../backend/docs/API.md)
- [ORIGIN.md](./ORIGIN.md)
