"""Proposal API routes (nested under projects + review actions)."""

from django.urls import path

from .views import (
    ProjectProposalSubmitView,
    ProjectProposalView,
    ProposalApproveView,
    ProposalRejectView,
)

urlpatterns = [
    path(
        "projects/<int:project_pk>/proposal/",
        ProjectProposalView.as_view(),
        name="project-proposal",
    ),
    path(
        "projects/<int:project_pk>/proposal/submit/",
        ProjectProposalSubmitView.as_view(),
        name="project-proposal-submit",
    ),
    path(
        "proposals/<int:pk>/approve/",
        ProposalApproveView.as_view(),
        name="proposal-approve",
    ),
    path(
        "proposals/<int:pk>/reject/",
        ProposalRejectView.as_view(),
        name="proposal-reject",
    ),
]
