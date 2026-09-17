"""Proposal API routes (nested under projects + review actions + admin list)."""

from django.urls import path

from proposals.admin_api.views import AdminProposalListView
from proposals.api.views import (
    ProjectProposalSubmitView,
    ProjectProposalView,
    ProposalApproveView,
    ProposalRejectView,
)

urlpatterns = [
    path(
        "projects/<uuid:project_pk>/proposal/",
        ProjectProposalView.as_view(),
        name="project-proposal",
    ),
    path(
        "projects/<uuid:project_pk>/proposal/submit/",
        ProjectProposalSubmitView.as_view(),
        name="project-proposal-submit",
    ),
    path(
        "proposals/<uuid:pk>/approve/",
        ProposalApproveView.as_view(),
        name="proposal-approve",
    ),
    path(
        "proposals/<uuid:pk>/reject/",
        ProposalRejectView.as_view(),
        name="proposal-reject",
    ),
    path(
        "admin/proposals/",
        AdminProposalListView.as_view(),
        name="admin-proposals",
    ),
]
