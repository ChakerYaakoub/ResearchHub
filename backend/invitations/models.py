import secrets
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from projects.models import ResearchProject


class InvitationRole(models.TextChoices):
    EDITOR = "EDITOR", "Editor"
    VIEWER = "VIEWER", "Viewer"


class InvitationStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    ACCEPTED = "ACCEPTED", "Accepted"
    DECLINED = "DECLINED", "Declined"
    EXPIRED = "EXPIRED", "Expired"


def default_invitation_token() -> str:
    return secrets.token_urlsafe(32)


def default_invitation_expiry():
    return timezone.now() + timedelta(days=7)


class Invitation(models.Model):
    project = models.ForeignKey(
        ResearchProject,
        on_delete=models.CASCADE,
        related_name="invitations",
    )
    email = models.EmailField()
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="sent_invitations",
    )
    role = models.CharField(
        max_length=20,
        choices=InvitationRole.choices,
    )
    token = models.CharField(
        max_length=64,
        unique=True,
        default=default_invitation_token,
        editable=False,
    )
    status = models.CharField(
        max_length=20,
        choices=InvitationStatus.choices,
        default=InvitationStatus.PENDING,
    )
    expires_at = models.DateTimeField(default=default_invitation_expiry)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Invite {self.email} to {self.project} ({self.status})"
