"""Proposal submit / review workflows (Phase 6).

Atomic project+proposal status updates. Call from thin views after AuthZ;
invalid state raises ``WorkflowError``.
"""

from django.db import transaction
from django.utils import timezone

from projects.models import ProjectStatus, ResearchProject
from projects.services import WorkflowError, is_preparing, transition_project

from .models import Proposal, ProposalStatus


@transaction.atomic
def submit_proposal(project: ResearchProject) -> Proposal:
    """
    Submit (or resubmit) proposal into scientific review.

    DRAFT → SUBMITTED → UNDER_REVIEW
    REJECTED → RESUBMITTED → UNDER_REVIEW
    """
    if not is_preparing(project):
        raise WorkflowError(
            "Proposal can only be submitted when project is DRAFT or REJECTED "
            f"(now {project.status})."
        )
    try:
        proposal = project.proposal
    except Proposal.DoesNotExist as exc:
        raise WorkflowError("Project has no proposal to submit.") from exc

    proposal.status = ProposalStatus.PENDING
    proposal.submitted_at = timezone.now()
    proposal.save(update_fields=["status", "submitted_at"])

    if project.status == ProjectStatus.DRAFT:
        transition_project(project, ProjectStatus.SUBMITTED)
        transition_project(project, ProjectStatus.UNDER_REVIEW)
    else:
        transition_project(project, ProjectStatus.RESUBMITTED)
        transition_project(project, ProjectStatus.UNDER_REVIEW)
    return proposal


@transaction.atomic
def approve_proposal(proposal: Proposal, review_comment: str = "") -> Proposal:
    """Approve when project is UNDER_REVIEW and proposal is PENDING."""
    project = proposal.project
    if project.status != ProjectStatus.UNDER_REVIEW:
        raise WorkflowError(
            f"Proposal can only be approved when project is UNDER_REVIEW (now {project.status})."
        )
    if proposal.status != ProposalStatus.PENDING:
        raise WorkflowError(
            f"Proposal can only be approved when status is PENDING (now {proposal.status})."
        )

    proposal.status = ProposalStatus.APPROVED
    proposal.reviewed_at = timezone.now()
    proposal.review_comment = review_comment or ""
    proposal.save(update_fields=["status", "reviewed_at", "review_comment"])
    transition_project(project, ProjectStatus.APPROVED)
    return proposal


@transaction.atomic
def reject_proposal(proposal: Proposal, review_comment: str = "") -> Proposal:
    """Reject when project is UNDER_REVIEW and proposal is PENDING."""
    project = proposal.project
    if project.status != ProjectStatus.UNDER_REVIEW:
        raise WorkflowError(
            f"Proposal can only be rejected when project is UNDER_REVIEW (now {project.status})."
        )
    if proposal.status != ProposalStatus.PENDING:
        raise WorkflowError(
            f"Proposal can only be rejected when status is PENDING (now {proposal.status})."
        )

    proposal.status = ProposalStatus.REJECTED
    proposal.reviewed_at = timezone.now()
    proposal.review_comment = review_comment or ""
    proposal.save(update_fields=["status", "reviewed_at", "review_comment"])
    transition_project(project, ProjectStatus.REJECTED)
    return proposal
