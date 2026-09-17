# Authorization (UI permissions)

client-ui shows or hides actions based on project membership and status. **This is UX only.** The backend enforces AuthZ and returns 403/404 for unauthorized access.

## Platform role

`user.role` (`RESEARCHER`, etc.) is stored from the API. client-ui does **not** use platform ADMIN roles for routing — researchers use this app; admins use admin-ui.

## Project membership (Project Details)

Computed in `useProjectDetails`:

| Flag | Meaning | Typical UI |
|------|---------|------------|
| `isOwner` | `project.owner === user.id` | Delete project; invite collaborators; cancel invites |
| `canEdit` | Owner or membership `OWNER` / `EDITOR` | Edit proposal, experiments, publications; submit; complete |
| Viewer | Member with `VIEWER` only | Read-only on mutate sections |

Invitation roles offered in the UI: `EDITOR` | `VIEWER` (not OWNER).

## Status / kind gates (Project Details sections)

These flags hide create/edit actions in the UI; the API re-checks the same product rules.

| UI capability | When shown |
|---------------|------------|
| Edit proposal | `canEdit` and status `DRAFT` or `REJECTED` |
| Draft-prep Submit step | Same + proposal exists |
| Add PLANNED experiment | `canEdit` and preparing (`DRAFT` / `REJECTED`) |
| Add EXECUTED experiment | `canEdit` and `APPROVED` / `IN_PROGRESS` |
| Add EXISTING publication | `canEdit` and preparing |
| Add RESULTING publication | `canEdit` and `IN_PROGRESS` / `COMPLETED` |
| Complete project | `canEdit` and status `IN_PROGRESS` |
| Delete project | `isOwner` only |

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md) · [ROUTING.md](./ROUTING.md) · Backend: [`backend/docs/AUTHORIZATION.md`](../../backend/docs/AUTHORIZATION.md)
