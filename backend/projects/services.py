"""Project lifecycle transitions (Phase 6)."""

from django.db import transaction

from .models import ProjectStatus, ResearchProject

# Allowed directed edges for ResearchProject.status.
ALLOWED_TRANSITIONS: dict[str, frozenset[str]] = {
    ProjectStatus.DRAFT: frozenset({ProjectStatus.SUBMITTED}),
    ProjectStatus.SUBMITTED: frozenset({ProjectStatus.UNDER_REVIEW}),
    ProjectStatus.UNDER_REVIEW: frozenset(
        {ProjectStatus.APPROVED, ProjectStatus.REJECTED}
    ),
    ProjectStatus.APPROVED: frozenset({ProjectStatus.IN_PROGRESS}),
    ProjectStatus.IN_PROGRESS: frozenset({ProjectStatus.COMPLETED}),
    ProjectStatus.REJECTED: frozenset({ProjectStatus.RESUBMITTED}),
    ProjectStatus.RESUBMITTED: frozenset({ProjectStatus.UNDER_REVIEW}),
    ProjectStatus.COMPLETED: frozenset(),
    ProjectStatus.SOFT_DELETED: frozenset(),
}

# Draft-like statuses: revise proposal / planned experiments / existing pubs.
PREPARING_STATUSES = frozenset(
    {ProjectStatus.DRAFT, ProjectStatus.REJECTED}
)


class WorkflowError(Exception):
    """Invalid project/proposal lifecycle transition."""

    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)


def is_preparing(project: ResearchProject) -> bool:
    """True when researchers may still prepare draft-like content."""
    return project.status in PREPARING_STATUSES


def transition_project(project: ResearchProject, to_status: str) -> ResearchProject:
    """Move project to `to_status` if the edge is allowed; otherwise raise WorkflowError."""
    current = project.status
    allowed = ALLOWED_TRANSITIONS.get(current, frozenset())
    if to_status not in allowed:
        raise WorkflowError(
            f"Cannot transition project from {current} to {to_status}."
        )
    project.status = to_status
    project.save(update_fields=["status", "updated_at"])
    return project


@transaction.atomic
def start_project(project: ResearchProject) -> ResearchProject:
    """APPROVED → IN_PROGRESS."""
    return transition_project(project, ProjectStatus.IN_PROGRESS)


@transaction.atomic
def complete_project(project: ResearchProject) -> ResearchProject:
    """IN_PROGRESS → COMPLETED."""
    return transition_project(project, ProjectStatus.COMPLETED)


@transaction.atomic
def soft_delete_project(project: ResearchProject) -> ResearchProject:
    """Mark project SOFT_DELETED (client delete). Already soft-deleted is a no-op."""
    if project.status == ProjectStatus.SOFT_DELETED:
        return project
    project.status = ProjectStatus.SOFT_DELETED
    project.save(update_fields=["status", "updated_at"])
    return project


def assert_can_mutate_experiments(project: ResearchProject, kind: str) -> None:
    """PLANNED only while preparing; EXECUTED only when APPROVED or IN_PROGRESS."""
    from experiments.models import ExperimentKind

    if kind == ExperimentKind.PLANNED:
        if not is_preparing(project):
            raise WorkflowError(
                "Planned experiments can only be added or changed when the "
                "project is DRAFT or REJECTED."
            )
        return
    if kind == ExperimentKind.EXECUTED:
        if project.status not in (
            ProjectStatus.APPROVED,
            ProjectStatus.IN_PROGRESS,
        ):
            raise WorkflowError(
                "Executed experiments can only be added or changed when the "
                "project is APPROVED or IN_PROGRESS."
            )
        return
    raise WorkflowError(f"Unknown experiment kind: {kind}.")


def assert_can_mutate_publications(project: ResearchProject, kind: str) -> None:
    """EXISTING only while preparing; RESULTING when IN_PROGRESS or COMPLETED."""
    from publications.models import PublicationKind

    if kind == PublicationKind.EXISTING:
        if not is_preparing(project):
            raise WorkflowError(
                "Existing publications can only be added or changed when the "
                "project is DRAFT or REJECTED."
            )
        return
    if kind == PublicationKind.RESULTING:
        if project.status not in (
            ProjectStatus.IN_PROGRESS,
            ProjectStatus.COMPLETED,
        ):
            raise WorkflowError(
                "Resulting publications can only be added or changed when the "
                "project is IN_PROGRESS or COMPLETED."
            )
        return
    raise WorkflowError(f"Unknown publication kind: {kind}.")
