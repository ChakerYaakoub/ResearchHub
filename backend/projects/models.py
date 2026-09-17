"""Research projects and collaborator memberships."""

from django.conf import settings
from django.db import models


class ProjectStatus(models.TextChoices):
    """Project lifecycle (invalid transitions rejected in Phase 6)."""

    DRAFT = "DRAFT", "Draft"
    SUBMITTED = "SUBMITTED", "Submitted"
    UNDER_REVIEW = "UNDER_REVIEW", "Under review"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"
    RESUBMITTED = "RESUBMITTED", "Resubmitted"
    IN_PROGRESS = "IN_PROGRESS", "In progress"
    COMPLETED = "COMPLETED", "Completed"
    SOFT_DELETED = "SOFT_DELETED", "Soft deleted"


class MembershipRole(models.TextChoices):
    """Role inside one project (OWNER recommended for uniform authz checks)."""

    OWNER = "OWNER", "Owner"
    EDITOR = "EDITOR", "Editor"
    VIEWER = "VIEWER", "Viewer"


class ResearchProject(models.Model):
    """Scientific project owned by a user; collaborators via ProjectMembership."""

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    scientific_objective = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=ProjectStatus.choices,
        default=ProjectStatus.DRAFT,
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="owned_projects",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"], name="projects_status_idx"),
            models.Index(fields=["-created_at"], name="projects_created_at_idx"),
        ]

    def __str__(self) -> str:
        return self.title


class ProjectMembership(models.Model):
    """
    User↔project link with a project role.
    Created on invitation accept (Phase 7); unique per (project, user).
    """

    project = models.ForeignKey(
        ResearchProject,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="project_memberships",
    )
    role = models.CharField(max_length=20, choices=MembershipRole.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["project", "user"],
                name="unique_project_membership",
            ),
        ]
        ordering = ["project_id", "user_id"]

    def __str__(self) -> str:
        return f"{self.user} @ {self.project} ({self.role})"
