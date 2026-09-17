# Models

Domain primary keys are **UUIDs**.

## Entity overview

```text
User
 ├── owns → ResearchProject
 └── collaborates → ResearchProject (via ProjectMembership)

ResearchProject
 ├── Proposal (1:1)
 ├── Experiment (1:N)
 ├── Publication (1:N)
 ├── Invitation (1:N)
 └── ProjectMembership (1:N)

Installation
 └── Instrument (1:N)
      └── Experiment (FK, PROTECT)
```

## users.User

| Field / rule | Notes |
|--------------|-------|
| `id` | UUID PK |
| `email` | Unique; login id (`USERNAME_FIELD`) |
| `username` | Still required by AbstractUser; validated charset |
| `role` | `SUPER_ADMIN` \| `ADMIN` \| `RESEARCHER` |
| Manager | `create_superuser` sets `SUPER_ADMIN` |

## projects.ResearchProject

| Field | Notes |
|-------|-------|
| `id` | UUID PK |
| `title`, `description`, `scientific_objective` | Text fields |
| `status` | See [WORKFLOWS.md](./WORKFLOWS.md) |
| `owner` | FK User, `PROTECT` |
| Indexes | `status`, `-created_at` |

## projects.ProjectMembership

| Field / rule | Notes |
|--------------|-------|
| Unique | `(project, user)` |
| `role` | `OWNER` \| `EDITOR` \| `VIEWER` |
| Lifecycle | Created on project create (owner) and on invitation accept |

## proposals.Proposal

| Field / rule | Notes |
|--------------|-------|
| `project` | OneToOne → ResearchProject |
| `methodology`, `expected_results` | Text |
| `status` | `PENDING` \| `APPROVED` \| `REJECTED` |
| `submitted_at`, `reviewed_at`, `review_comment` | Filled by workflow |

## experiments.Experiment

| Field / rule | Notes |
|--------------|-------|
| `kind` | `PLANNED` \| `EXECUTED` — drives mutate gates |
| `instrument` | FK Instrument, `PROTECT` |
| `scheduled_date` | DateTime |
| `status` | `PLANNED` \| `SCHEDULED` \| `COMPLETED` \| `CANCELLED` |

## publications.Publication

| Field / rule | Notes |
|--------------|-------|
| `kind` | `EXISTING` \| `RESULTING` — drives mutate gates |
| `title`, `authors` | Required (validated) |
| `doi`, `journal`, `url`, `publication_date` | Optional |

## invitations.Invitation

| Field / rule | Notes |
|--------------|-------|
| `token` | Unique, `secrets.token_urlsafe(32)`, not editable |
| `expires_at` | Default now + 7 days |
| `email` | Invitee; must match on accept |
| `role` | `EDITOR` \| `VIEWER` only (not OWNER) |
| `status` | `PENDING` \| `ACCEPTED` \| `DECLINED` \| `EXPIRED` |
| Security | Token omitted from project list APIs; membership only after accept |

## facilities.Installation / Instrument

| Model | Key rules |
|-------|-----------|
| Installation | `ACTIVE` \| `INACTIVE` |
| Instrument | Unique `(installation, code)`; `AVAILABLE` \| `UNAVAILABLE` |
| Selectable | AVAILABLE instrument under ACTIVE installation |

## Related

- Workflows: [WORKFLOWS.md](./WORKFLOWS.md)
- API map: [API.md](./API.md)
