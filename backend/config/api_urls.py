"""Aggregate `/api/` URL includes for ResearchHub domain apps."""

from django.urls import include, path

urlpatterns = [
    path("auth/", include("users.urls")),
    path("", include("projects.urls")),
    path("", include("proposals.urls")),
    path("", include("experiments.urls")),
    path("", include("publications.urls")),
    path("", include("invitations.urls")),
]
