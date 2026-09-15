"""Experiments scheduled against a project (instrument is free text for MVP)."""

from django.db import models

from projects.models import ResearchProject


class ExperimentStatus(models.TextChoices):
    PLANNED = "PLANNED", "Planned"
    SCHEDULED = "SCHEDULED", "Scheduled"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"


class Experiment(models.Model):
    project = models.ForeignKey(
        ResearchProject,
        on_delete=models.CASCADE,
        related_name="experiments",
    )
    instrument = models.CharField(max_length=255)
    scheduled_date = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=ExperimentStatus.choices,
        default=ExperimentStatus.PLANNED,
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["scheduled_date"]

    def __str__(self) -> str:
        return f"{self.instrument} ({self.project})"
