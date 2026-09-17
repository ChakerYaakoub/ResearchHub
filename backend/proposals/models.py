"""Scientific proposal — one per project (MVP)."""

import uuid

from django.db import models

from projects.models import ResearchProject


class ProposalStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class Proposal(models.Model):
    """Methodology / expected results; review fields filled when admins act."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.OneToOneField(
        ResearchProject,
        on_delete=models.CASCADE,
        related_name="proposal",
    )
    methodology = models.TextField(blank=True)
    expected_results = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_comment = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=ProposalStatus.choices,
        default=ProposalStatus.PENDING,
    )

    class Meta:
        ordering = ["project_id"]
        indexes = [
            models.Index(fields=["status"], name="proposals_status_idx"),
            models.Index(fields=["submitted_at"], name="proposals_submitted_at_idx"),
        ]

    def __str__(self) -> str:
        return f"Proposal for {self.project}"
