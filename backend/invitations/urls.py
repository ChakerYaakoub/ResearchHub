"""Invitation routes under `/api/`."""

from django.urls import path

from .views import (
    InvitationAcceptView,
    InvitationDeclineView,
    MyInvitationListView,
    ProjectInvitationCancelView,
    ProjectInvitationListCreateView,
)

urlpatterns = [
    path(
        "projects/<int:project_pk>/invitations/",
        ProjectInvitationListCreateView.as_view(),
        name="project-invitations",
    ),
    path(
        "projects/<int:project_pk>/invitations/<int:invitation_id>/",
        ProjectInvitationCancelView.as_view(),
        name="project-invitation-cancel",
    ),
    path("invitations/", MyInvitationListView.as_view(), name="my-invitations"),
    path(
        "invitations/<str:token>/accept/",
        InvitationAcceptView.as_view(),
        name="invitation-accept",
    ),
    path(
        "invitations/<str:token>/decline/",
        InvitationDeclineView.as_view(),
        name="invitation-decline",
    ),
]
