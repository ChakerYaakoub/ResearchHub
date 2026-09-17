# Privileged and destructive workflows

UI confirmations and role checks improve safety; the **Django API** remains authoritative (role + Origin).

## Proposal review

| Step | Detail |
|------|--------|
| Who (UI) | Platform ADMIN / SUPER_ADMIN |
| Where | `/proposals` (Dashboard links to review queue) |
| API | `POST /proposals/{id}/approve/` or `…/reject/` with `{ review_comment }` |
| Confirm | Comment dialog via ConfirmDialog / Popup |
| After | Toast; list refreshes |

## Activate / deactivate researcher

| Step | Detail |
|------|--------|
| Who (UI) | Platform admin; not self |
| Where | `/users` |
| API | `PATCH /admin/users/{id}/` `{ is_active }` |
| After | Toast; list refreshes |

## Create / deactivate admin

| Step | Detail |
|------|--------|
| Who (UI) | SUPER_ADMIN only (`/admins`) |
| Create | `POST /admin/users/` `{ email, username? }` |
| Deactivate | `PATCH /admin/users/{id}/` — not self, not `SUPER_ADMIN` target |
| After | Toast; list refreshes |

## Delete project

| Step | Detail |
|------|--------|
| Who (UI) | Platform admin |
| Where | `/projects/:id` |
| API | `DELETE /admin/projects/{id}/` |
| Confirm | ConfirmDialog (permanent) |
| After | Navigate to `/projects` |

## Facilities CRUD

| Step | Detail |
|------|--------|
| Who (UI) | Platform admin |
| Where | `/installations`, `/instruments` |
| API | POST/PATCH/DELETE under `/admin/installations/` and `/admin/instruments/` |
| Confirm | ConfirmDialog on delete |

## Revoke invitation

| Step | Detail |
|------|--------|
| Who (UI) | Platform admin |
| Where | `/invitations` |
| API | `DELETE /admin/invitations/{id}/` |
| Confirm | ConfirmDialog for pending |

## Publications

List + detail popup only — **no** admin create/update/delete for publications in this app.

## Related

- [AUTHORIZATION.md](./AUTHORIZATION.md) · [API.md](./API.md) · [ORIGIN.md](./ORIGIN.md)
