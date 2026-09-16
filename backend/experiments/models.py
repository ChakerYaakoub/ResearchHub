"""Experiments scheduled against a project."""

from django.db import models

from facilities.models import Instrument
from projects.models import ResearchProject


class ExperimentKind(models.TextChoices):
    """PLANNED = proposal intent; EXECUTED = after acceptance."""

    PLANNED = "PLANNED", "Planned"
    EXECUTED = "EXECUTED", "Executed"


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
    kind = models.CharField(
        max_length=20,
        choices=ExperimentKind.choices,
        default=ExperimentKind.PLANNED,
    )
    instrument = models.ForeignKey(
        Instrument,
        on_delete=models.PROTECT,
        related_name="experiments",
    )
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
