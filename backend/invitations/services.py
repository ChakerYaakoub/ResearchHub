"""Invitation create / accept / decline / cancel (Phase 7)."""

from urllib.parse import urlencode

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from core.mail import send_app_email
from projects.models import MembershipRole, ProjectMembership, ResearchProject
from users.models import User

from .models import Invitation, InvitationRole, InvitationStatus


class InvitationError(Exception):
    """Invalid invitation operation."""

    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)


def send_invitation_email(invitation: Invitation) -> None:
    """Email invitee with login or register deep-link (never blocks create)."""
    project = invitation.project
    email = invitation.email.lower().strip()
    has_account = User.objects.filter(email__iexact=email).exists()
    auth = "login" if has_account else "register"
    query = urlencode({"auth": auth, "token": invitation.token})
    link = f"{settings.CLIENT_UI_ORIGIN}/?{query}"

    if has_account:
        action_line = (
            f"Please log in with this email ({email}) to accept or decline "
            "the invitation in ResearchHub."
        )
    else:
        action_line = (
            f"Please register with this email ({email}) to accept or decline "
            "the invitation in ResearchHub."
        )

    subject = f"You're invited to {project.title} on ResearchHub"
    body = (
        f"You have been invited to the project \"{project.title}\" "
        f"as {invitation.role}.\n\n"
        f"{action_line}\n\n"
        f"Open this link to continue:\n{link}\n\n"
        "After you sign in, open My invitations to accept or decline.\n"
        "If you do not want to join, you can ignore this email "
        "(or decline after signing in).\n\n"
        "Do not reply to this email.\n"
    )

    send_app_email(
        subject=subject,
        message=body,
        to=email,
        purpose=f"invitation email project={project.pk}",
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

    invitation = Invitation.objects.select_related("project").create(
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
