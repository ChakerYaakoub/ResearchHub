# API Layer

Native `fetch` via `apiFetch` in [`src/api/client.ts`](../src/api/client.ts). Base URL: `VITE_API_BASE_URL` (must include `/api`, trailing slash stripped).

Callers pass `token` from `useAuth().access` explicitly. On **401** (non-auth paths), `ensureFreshAccess()` runs once, then the request retries.

Errors throw `ApiError` (`status`, `body`, message). `formatApiError` maps DRF `detail` / field errors for toasts.

## Auth (`src/auth/authApi.ts`)

See [AUTHENTICATION.md](./AUTHENTICATION.md).

## Projects (`src/api/projects.ts`)

| Function | Method | Path |
|----------|--------|------|
| `listProjects` | GET | `/projects/` |
| `getProject` | GET | `/projects/{id}/` |
| `createProject` | POST | `/projects/` |
| `listCollaborators` | GET | `/projects/{id}/collaborators/` |
| `completeProject` | POST | `/projects/{id}/complete/` |
| `deleteProject` | DELETE | `/projects/{id}/` |

## Proposals (`src/api/proposals.ts`)

| Function | Method | Path |
|----------|--------|------|
| `getProposal` | GET | `/projects/{id}/proposal/` (404 → `null`) |
| `createProposal` | POST | `/projects/{id}/proposal/` |
| `updateProposal` | PUT | `/projects/{id}/proposal/` |
| `submitProposal` | POST | `/projects/{id}/proposal/submit/` |

## Experiments (`src/api/experiments.ts`)

| Function | Method | Path |
|----------|--------|------|
| `listExperiments` | GET | `/projects/{id}/experiments/` |
| `createExperiment` | POST | `/projects/{id}/experiments/` |
| `updateExperiment` | PATCH | `/experiments/{id}/` |
| `deleteExperiment` | DELETE | `/experiments/{id}/` |

## Publications (`src/api/publications.ts`)

| Function | Method | Path |
|----------|--------|------|
| `listPublications` | GET | `/projects/{id}/publications/` |
| `createPublication` | POST | `/projects/{id}/publications/` |
| `updatePublication` | PATCH | `/publications/{id}/` |
| `deletePublication` | DELETE | `/publications/{id}/` |

## Invitations (`src/api/invitations.ts`)

| Function | Method | Path |
|----------|--------|------|
| `listMyInvitations` | GET | `/invitations/` |
| `listProjectInvitations` | GET | `/projects/{id}/invitations/` |
| `createProjectInvitation` | POST | `/projects/{id}/invitations/` |
| `cancelProjectInvitation` | DELETE | `/projects/{id}/invitations/{invitationId}/` |
| `acceptInvitation` | POST | `/invitations/{token}/accept/` |
| `declineInvitation` | POST | `/invitations/{token}/decline/` |

## Facilities (`src/api/facilities.ts`)

| Function | Method | Path |
|----------|--------|------|
| `listInstallations` | GET | `/installations/` |
| `listInstruments` | GET | `/instruments/` (optional `?installation=`) |

## Related

- Types: [`src/types/api.ts`](../src/types/api.ts)
- Backend map: [`backend/docs/API.md`](../../backend/docs/API.md)
