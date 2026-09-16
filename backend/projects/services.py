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
    ProjectStatus.REJECTED: frozenset(),
    ProjectStatus.COMPLETED: frozenset(),
}


class WorkflowError(Exception):
    """Invalid project/proposal lifecycle transition."""

    def __init__(self, detail: str):
        self.detail = detail
        super().__init__(detail)


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


def assert_can_mutate_experiments(project: ResearchProject) -> None:
    """Experiments only after proposal approval (APPROVED or IN_PROGRESS)."""
    if project.status not in (
        ProjectStatus.APPROVED,
        ProjectStatus.IN_PROGRESS,
    ):
        raise WorkflowError(
            "Experiments can only be added or changed when the project is "
            "APPROVED or IN_PROGRESS."
        )


def assert_can_mutate_publications(project: ResearchProject) -> None:
    """Publications only after work has started (IN_PROGRESS or COMPLETED)."""
    if project.status not in (
        ProjectStatus.IN_PROGRESS,
        ProjectStatus.COMPLETED,
    ):
        raise WorkflowError(
            "Publications can only be added or changed when the project is "
            "IN_PROGRESS or COMPLETED."
        )
