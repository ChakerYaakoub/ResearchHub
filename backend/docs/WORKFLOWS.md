# Business Workflows

Workflows that are more than CRUD live in `services.py`. Views call services after permission and serializer validation.

## Project status lifecycle

Allowed edges (`projects/services.py` → `ALLOWED_TRANSITIONS`):

```text
DRAFT ──────────► SUBMITTED ──► UNDER_REVIEW ──► APPROVED ──► IN_PROGRESS ──► COMPLETED
                                      │
                                      └──────────► REJECTED ──► RESUBMITTED ──► UNDER_REVIEW

Any non-soft-deleted status may be soft-deleted via client DELETE → SOFT_DELETED
(soft delete bypasses the directed graph; already SOFT_DELETED is a no-op).
```

| Service | Transition |
|---------|------------|
| `submit_proposal` | DRAFT → SUBMITTED → UNDER_REVIEW **or** REJECTED → RESUBMITTED → UNDER_REVIEW |
| `approve_proposal` | UNDER_REVIEW → APPROVED (proposal → APPROVED) |
| `reject_proposal` | UNDER_REVIEW → REJECTED (proposal → REJECTED) |
| `start_project` | APPROVED → IN_PROGRESS (triggered when first EXECUTED experiment is created) |
| `complete_project` | IN_PROGRESS → COMPLETED (`POST /api/projects/{id}/complete/`) |
| `soft_delete_project` | → SOFT_DELETED |

Invalid transitions raise `WorkflowError` → API **400**.

**Preparing statuses** (draft-like content allowed): `DRAFT`, `REJECTED`.

## Proposal workflow

1. Owner/editor creates or updates proposal while project is preparing (`DRAFT` / `REJECTED`). One proposal per project (OneToOne).
2. `POST .../proposal/submit/` → proposal `PENDING`, project enters `UNDER_REVIEW`.
3. Platform admin (admin-ui Origin) approves or rejects with optional `review_comment`.
4. On reject, researchers may revise and resubmit (REJECTED → RESUBMITTED → UNDER_REVIEW).

Services: `proposals/services.py` (`submit_proposal`, `approve_proposal`, `reject_proposal`).

## Experiment kind gates

| Kind | Allowed project statuses |
|------|--------------------------|
| `PLANNED` | Preparing only (`DRAFT`, `REJECTED`) |
| `EXECUTED` | `APPROVED` or `IN_PROGRESS` |

First EXECUTED experiment on an `APPROVED` project calls `start_project` → `IN_PROGRESS`.

Instrument must be selectable: instrument `AVAILABLE` and parent installation `ACTIVE` (`facilities.services.assert_instrument_selectable`).

Enforced via `projects.services.assert_can_mutate_experiments` from experiment serializers/views.

## Publication kind gates

| Kind | Allowed project statuses |
|------|--------------------------|
| `EXISTING` | Preparing only (`DRAFT`, `REJECTED`) |
| `RESULTING` | `IN_PROGRESS` or `COMPLETED` |

Enforced via `projects.services.assert_can_mutate_publications`.

## Invitation workflow

```text
Owner creates invitation (PENDING)
        │  email sent (best-effort; create still succeeds if SMTP fails)
        ▼
Invitee registers/logs in with matching email
        │
        ├─ accept → ProjectMembership (EDITOR|VIEWER) + ACCEPTED
        ├─ decline → DECLINED (no membership)
        └─ expire  → EXPIRED (on accept/decline after expires_at)
Owner/admin may cancel PENDING (delete)
```

Security rules:

- Token: `secrets.token_urlsafe(32)`, unique, **7-day** expiry.
- Accept/decline: authenticated email must match invitation email.
- Membership is created **only on accept**, never on create.
- Project invitation **list** omits tokens; create response and “my invitations” may include token for UX.

Services: `invitations/services.py`.

## Email (mailer)

- Shared send: `core.mail.send_app_email` (plain text).
- Invitation copy + deep links (`CLIENT_UI_ORIGIN/?auth=login|register&token=…`): `invitations.services.send_invitation_email`.
- Welcome / password-reset / admin-welcome: `users/mail.py`.
- No Celery or background workers. Local: console backend. Production: SMTP via env.

## Related

- Models: [MODELS.md](./MODELS.md)
- API map: [API.md](./API.md)
