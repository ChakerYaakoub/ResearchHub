"""Aggregate `/api/` URL includes for ResearchHub domain apps."""

from django.urls import include, path

urlpatterns = [
    path("", include("projects.urls")),
    path("", include("proposals.urls")),
]
