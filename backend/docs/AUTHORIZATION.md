# Authorization (RBAC & IDOR)

Authorization is enforced **only on the backend**. Frontend route guards are UX; never trust the UI for security.

## Two role systems

| Scope | Roles | Stored on |
|-------|-------|-----------|
| **Platform (global)** | `SUPER_ADMIN`, `ADMIN`, `RESEARCHER` | `users.User.role` |
| **Project** | `OWNER`, `EDITOR`, `VIEWER` | `projects.ProjectMembership` (+ owner FK) |

Platform admins bypass project membership checks in permission classes. Project roles apply to researchers collaborating on a project.

## Project access matrix

| Action | VIEWER | EDITOR | OWNER | Platform ADMIN |
|--------|--------|--------|-------|----------------|
| Read project / nested resources | Yes | Yes | Yes | Yes |
| Update project, proposal, experiments, publications | No | Yes | Yes | Yes |
| Soft-delete project | No | No | Yes | Yes* |
| Manage invitations / remove collaborators | No | No | Yes | Yes |
| Approve / reject proposal | No | No | No | Yes (+ Origin) |

\* Admin hard-delete is a separate admin-panel path; client `DELETE` soft-deletes (`SOFT_DELETED`).

## Permission classes (`core/permissions.py`)

| Class | Rule |
|-------|------|
| `IsAdminUiOrigin` | `Origin` (or `Referer` fallback) ∈ `ADMIN_UI_ORIGINS`. Empty list → allow (dev convenience). Stack with `IsPlatformAdmin`. |
| `IsPlatformAdmin` | `SUPER_ADMIN`, `ADMIN`, or `is_staff` |
| `IsSuperAdmin` | `SUPER_ADMIN` only (e.g. create admin accounts, list admins) |
| `IsProjectMember` | Object-level: any membership / owner / platform admin |
| `IsProjectEditor` | OWNER or EDITOR (or admin) |
| `IsProjectOwnerOrAdmin` | OWNER or platform admin |
| `IsProjectMemberReadEditorWrite` | SAFE methods: member+; writes: editor+ |

Object-level checks resolve nested resources via `obj.project` when the object is not a `ResearchProject`.

## IDOR prevention

Always combine:

1. **Permissions** (who may act)
2. **Filtered querysets / selectors** (what rows exist for that user)

Key selectors (`projects/selectors.py`):

| Function | Behavior |
|----------|----------|
| `projects_visible_to(user)` | All projects for platform admin; else owner ∪ membership, excluding `SOFT_DELETED` |
| `get_visible_project(user, pk)` | 404 if not in visible set |
| `user_project_role(user, project)` | OWNER/EDITOR/VIEWER or None (admin handled in permissions) |

Experiments and publications use app selectors (`get_visible_*`) that nest under visible projects — outsiders get **404**, not 403, for hidden resources (consistent anti-enumeration).

**Never** trust client-supplied `owner`, `role`, `project`, or `installation` ids to grant access. Owner is set server-side on create; parent project comes from the URL after visibility checks.

## Admin API gate

Routes under `/api/admin/*` and proposal `approve` / `reject` require **both**:

1. `IsPlatformAdmin`
2. `IsAdminUiOrigin` (`ADMIN_UI_ORIGINS`)

Missing Origin → **403**. Researcher JWT + correct Origin → **403**.

Super-admin-only operations (examples):

- `GET /api/admin/admins/`
- `POST /api/admin/users/` (create platform ADMIN)
- Patching another ADMIN/SUPER_ADMIN’s `is_active`

## Invitation AuthZ

- Create / cancel: project **OWNER** or platform admin.
- Accept / decline: authenticated user whose **email matches** the invitation (case-insensitive).
- Create does **not** grant membership; only accept does.

## Related

- Authentication: [AUTHENTICATION.md](./AUTHENTICATION.md)
- Security: [SECURITY.md](./SECURITY.md)
- Workflows: [WORKFLOWS.md](./WORKFLOWS.md)
