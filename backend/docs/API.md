# Backend API Map

Base path: `/api/`. URL aggregation: `config/api_urls.py`.

Path IDs are **UUIDs** unless noted. Invitation accept/decline uses opaque `{token}` string.

## Auth — `users`

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/auth/register/` | Public |
| POST | `/api/auth/login/` | Public |
| POST | `/api/auth/refresh/` | Public |
| POST | `/api/auth/logout/` | Authenticated |
| GET/PATCH | `/api/auth/me/` | Authenticated |
| POST | `/api/auth/password-reset/` | Public |
| POST | `/api/auth/password-reset/confirm/` | Public |

## Projects — `projects`

| Method | Path | AuthZ |
|--------|------|-------|
| GET/POST | `/api/projects/` | Auth; list filtered |
| GET/PUT/PATCH/DELETE | `/api/projects/{id}/` | Member / editor / owner as applicable |
| POST | `/api/projects/{id}/complete/` | Editor+ |
| GET | `/api/projects/{id}/collaborators/` | Member |
| DELETE | `/api/projects/{id}/collaborators/{user_id}/` | Owner/admin; cannot remove owner |

## Proposals — `proposals`

| Method | Path | AuthZ |
|--------|------|-------|
| GET/POST/PUT | `/api/projects/{id}/proposal/` | Member read; editor write (preparing) |
| POST | `/api/projects/{id}/proposal/submit/` | Editor+ |
| POST | `/api/proposals/{id}/approve/` | Admin + Origin |
| POST | `/api/proposals/{id}/reject/` | Admin + Origin |

## Experiments — `experiments`

| Method | Path | AuthZ |
|--------|------|-------|
| GET/POST | `/api/projects/{id}/experiments/` | Member read; editor write |
| GET/PUT/PATCH/DELETE | `/api/experiments/{id}/` | Member read; editor write |

## Publications — `publications`

| Method | Path | AuthZ |
|--------|------|-------|
| GET/POST | `/api/projects/{id}/publications/` | Member read; editor write |
| GET/PUT/PATCH/DELETE | `/api/publications/{id}/` | Member read; editor write |

## Invitations — `invitations`

| Method | Path | AuthZ |
|--------|------|-------|
| GET/POST | `/api/projects/{id}/invitations/` | Owner create; member list (no tokens on list) |
| DELETE | `/api/projects/{id}/invitations/{invitation_id}/` | Owner cancel |
| GET | `/api/invitations/` | Own email only (token visible) |
| POST | `/api/invitations/{token}/accept/` | Email match |
| POST | `/api/invitations/{token}/decline/` | Email match |

## Facilities — `facilities`

| Method | Path | AuthZ |
|--------|------|-------|
| GET | `/api/installations/` | Authenticated; ACTIVE only for researchers |
| GET | `/api/instruments/` | Authenticated; AVAILABLE (+ ACTIVE parent) |
| GET/POST | `/api/admin/installations/` | Admin + Origin |
| GET/PATCH/DELETE | `/api/admin/installations/{id}/` | Admin + Origin |
| GET/POST | `/api/admin/instruments/` | Admin + Origin |
| GET/PATCH/DELETE | `/api/admin/instruments/{id}/` | Admin + Origin |

## Admin panel

All require **platform ADMIN + Origin ∈ `ADMIN_UI_ORIGINS`**.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/admin/stats/` | Dashboard counters |
| GET | `/api/admin/users/` | Researchers only |
| POST | `/api/admin/users/` | SUPER_ADMIN creates ADMIN |
| PATCH | `/api/admin/users/{id}/` | `is_active` only |
| GET | `/api/admin/admins/` | SUPER_ADMIN only |
| GET | `/api/admin/projects/` | Includes soft-deleted |
| GET | `/api/admin/projects/{id}/` | Nested detail |
| GET | `/api/admin/proposals/` | Filters: `status`, `queue=review` |
| GET | `/api/admin/experiments/` | List |
| GET | `/api/admin/publications/` | List |
| GET | `/api/admin/invitations/` | List |
| DELETE | `/api/admin/invitations/{id}/` | Cancel pending |

## Error shape

Prefer:

```json
{
  "detail": "Human-readable message",
  "errors": {}
}
```

Helper: `core.api.api_error`. Meaningful status codes: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `429`.

## Related

- Auth: [AUTHENTICATION.md](./AUTHENTICATION.md)
- AuthZ: [AUTHORIZATION.md](./AUTHORIZATION.md)
- Workflows: [WORKFLOWS.md](./WORKFLOWS.md)
