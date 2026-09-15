"""Scientific proposal — one per project (MVP)."""

from django.db import models

from projects.models import ResearchProject


class ProposalStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class Proposal(models.Model):
    """Methodology / expected results; review fields filled when admins act."""

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

    def __str__(self) -> str:
        return f"Proposal for {self.project}"
