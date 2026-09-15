"""Invitation create / accept / decline / cancel (Phase 7)."""

import logging

from django.db import transaction
from django.utils import timezone

from projects.models import MembershipRole, ProjectMembership, ResearchProject

from .models import Invitation, InvitationRole, InvitationStatus

logger = logging.getLogger(__name__)


class InvitationError(Exception):
    """Invalid invitation operation."""

    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)


def send_invitation_email(invitation: Invitation) -> None:
    """Stub until Phase 14 (Mailer). Logs only; never blocks create."""
    logger.info(
        "Invitation email stub: project=%s email=%s token=%s",
        invitation.project_id,
        invitation.email,
        invitation.token,
    )


def _ensure_pending_and_fresh(invitation: Invitation) -> Invitation:
    """Reject non-pending or expired invites; mark EXPIRED when past expires_at.

    Expiry is persisted with a queryset update *before* raising so it is not
    rolled back if the caller later raises inside ``transaction.atomic``.
    """
    if invitation.status != InvitationStatus.PENDING:
        raise InvitationError(
            f"Invitation is not pending (status={invitation.status})."
        )
    if invitation.expires_at <= timezone.now():
        Invitation.objects.filter(
            pk=invitation.pk, status=InvitationStatus.PENDING
        ).update(status=InvitationStatus.EXPIRED)
        invitation.status = InvitationStatus.EXPIRED
        raise InvitationError("Invitation has expired.")
    return invitation


def _assert_email_match(invitation: Invitation, user) -> None:
    if user.email.lower().strip() != invitation.email.lower().strip():
        raise InvitationError(
            "Authenticated user email does not match this invitation."
        )


@transaction.atomic
def create_project_invitation(
    project: ResearchProject,
    invited_by,
    email: str,
    role: str,
) -> Invitation:
    """Create PENDING invitation; does not create membership."""
    email = email.lower().strip()
    if role not in InvitationRole.values:
        raise InvitationError("Invalid invitation role.")
    if ProjectMembership.objects.filter(
        project=project, user__email__iexact=email
    ).exists():
        raise InvitationError("User is already a project member.")
    if Invitation.objects.filter(
        project=project,
        email__iexact=email,
        status=InvitationStatus.PENDING,
    ).exists():
        raise InvitationError("A pending invitation already exists for this email.")

    invitation = Invitation.objects.create(
        project=project,
        invited_by=invited_by,
        email=email,
        role=role,
    )
    send_invitation_email(invitation)
    return invitation


def accept_invitation(token: str, user) -> Invitation:
    """Accept pending invite: email match → membership + ACCEPTED."""
    try:
        invitation = Invitation.objects.select_related("project").get(token=token)
    except Invitation.DoesNotExist as exc:
        raise InvitationError("Invitation not found.") from exc

    # Expiry must be marked outside the atomic block so EXPIRED is not rolled back.
    _ensure_pending_and_fresh(invitation)
    _assert_email_match(invitation, user)

    membership_role = (
        MembershipRole.EDITOR
        if invitation.role == InvitationRole.EDITOR
        else MembershipRole.VIEWER
    )
    with transaction.atomic():
        membership, created = ProjectMembership.objects.get_or_create(
            project=invitation.project,
            user=user,
            defaults={"role": membership_role},
        )
        if not created and membership.role != membership_role:
            membership.role = membership_role
            membership.save(update_fields=["role"])

        invitation.status = InvitationStatus.ACCEPTED
        invitation.accepted_at = timezone.now()
        invitation.save(update_fields=["status", "accepted_at"])
    return invitation


def decline_invitation(token: str, user) -> Invitation:
    """Decline pending invite; no membership."""
    try:
        invitation = Invitation.objects.select_related("project").get(token=token)
    except Invitation.DoesNotExist as exc:
        raise InvitationError("Invitation not found.") from exc

    _ensure_pending_and_fresh(invitation)
    _assert_email_match(invitation, user)

    invitation.status = InvitationStatus.DECLINED
    invitation.save(update_fields=["status"])
    return invitation


def cancel_invitation(invitation: Invitation) -> None:
    """Owner/admin cancels a pending invitation (delete)."""
    if invitation.status != InvitationStatus.PENDING:
        raise InvitationError("Only pending invitations can be cancelled.")
    invitation.delete()
