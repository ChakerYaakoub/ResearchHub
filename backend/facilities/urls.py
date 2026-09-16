"""Facilities API routes (researcher read + admin CRUD)."""

from django.urls import path

from .views import (
    AdminInstallationDetailView,
    AdminInstallationListCreateView,
    AdminInstrumentDetailView,
    AdminInstrumentListCreateView,
    InstallationListView,
    InstrumentListView,
)

urlpatterns = [
    path("installations/", InstallationListView.as_view(), name="installation-list"),
    path("instruments/", InstrumentListView.as_view(), name="instrument-list"),
    path(
        "admin/installations/",
        AdminInstallationListCreateView.as_view(),
        name="admin-installation-list",
    ),
    path(
        "admin/installations/<int:pk>/",
        AdminInstallationDetailView.as_view(),
        name="admin-installation-detail",
    ),
    path(
        "admin/instruments/",
        AdminInstrumentListCreateView.as_view(),
        name="admin-instrument-list",
    ),
    path(
        "admin/instruments/<int:pk>/",
        AdminInstrumentDetailView.as_view(),
        name="admin-instrument-detail",
    ),
]
