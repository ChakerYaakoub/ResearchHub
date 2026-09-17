"""Installation (facility) and Instrument (device) catalog."""

import uuid

from django.db import models


class InstallationStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    INACTIVE = "INACTIVE", "Inactive"


class InstrumentStatus(models.TextChoices):
    AVAILABLE = "AVAILABLE", "Available"
    UNAVAILABLE = "UNAVAILABLE", "Unavailable"


class Installation(models.Model):
    """Scientific facility / experimental location (admin-managed)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=20,
        choices=InstallationStatus.choices,
        default=InstallationStatus.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["status"], name="facilities_instl_status_idx"),
        ]

    def __str__(self) -> str:
        return self.name


class Instrument(models.Model):
    """Scientific device available within an installation (admin-managed)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    installation = models.ForeignKey(
        Installation,
        on_delete=models.PROTECT,
        related_name="instruments",
    )
    code = models.CharField(max_length=64)
    name = models.CharField(max_length=255)
    technique = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=InstrumentStatus.choices,
        default=InstrumentStatus.AVAILABLE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["installation__name", "code"]
        constraints = [
            models.UniqueConstraint(
                fields=["installation", "code"],
                name="uniq_instrument_installation_code",
            ),
        ]
        indexes = [
            models.Index(
                fields=["installation", "status"],
                name="facilities_instr_inst_st_idx",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.code} ({self.installation})"
