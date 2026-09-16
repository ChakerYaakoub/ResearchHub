"""Facilities catalog API tests."""

from django.test import TestCase, override_settings
from rest_framework import status

from experiments.models import Experiment, ExperimentKind
from facilities.models import Installation, InstallationStatus, Instrument, InstrumentStatus
from projects.models import ProjectStatus
from test_helpers import (
    admin_client,
    auth_client,
    make_admin,
    make_instrument,
    make_project,
    make_user,
)


@override_settings(ADMIN_UI_ORIGINS=["http://localhost:5175"])
class FacilitiesAdminApiTests(TestCase):
    def setUp(self):
        self.admin = make_admin("fadmin@example.com")
        self.admin_api = admin_client(self.admin)

    def test_admin_crud_installation_and_instrument(self):
        created = self.admin_api.post(
            "/api/admin/installations/",
            {
                "name": "X-ray Facility",
                "description": "Hall A",
                "location": "Building 1",
                "status": "ACTIVE",
            },
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        inst_id = created.data["id"]

        instrument = self.admin_api.post(
            "/api/admin/instruments/",
            {
                "installation": inst_id,
                "code": "XRD-01",
                "name": "Diffractometer",
                "technique": "XRD",
                "status": "AVAILABLE",
            },
            format="json",
        )
        self.assertEqual(instrument.status_code, status.HTTP_201_CREATED)

        listed = self.admin_api.get(f"/api/admin/instruments/?installation={inst_id}")
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        self.assertEqual(len(listed.data), 1)

    def test_researcher_cannot_admin_create(self):
        researcher = make_user("researcher@example.com")
        client = auth_client(researcher)
        response = client.post(
            "/api/admin/installations/",
            {"name": "Nope"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_blocked_when_instruments_or_experiments(self):
        instrument = make_instrument()
        blocked = self.admin_api.delete(
            f"/api/admin/installations/{instrument.installation_id}/"
        )
        self.assertEqual(blocked.status_code, status.HTTP_400_BAD_REQUEST)

        owner = make_user("owner-fac@example.com")
        project = make_project(owner)
        Experiment.objects.create(
            project=project,
            instrument=instrument,
            scheduled_date="2030-01-01T10:00:00Z",
        )
        blocked_inst = self.admin_api.delete(
            f"/api/admin/instruments/{instrument.id}/"
        )
        self.assertEqual(blocked_inst.status_code, status.HTTP_400_BAD_REQUEST)


class FacilitiesResearcherReadTests(TestCase):
    def setUp(self):
        self.user = make_user("picker@example.com")
        self.client = auth_client(self.user)
        self.active = Installation.objects.create(
            name="Active Lab", status=InstallationStatus.ACTIVE
        )
        self.inactive = Installation.objects.create(
            name="Closed Lab", status=InstallationStatus.INACTIVE
        )
        Instrument.objects.create(
            installation=self.active,
            code="A-1",
            name="Available",
            status=InstrumentStatus.AVAILABLE,
        )
        Instrument.objects.create(
            installation=self.active,
            code="A-2",
            name="Busy",
            status=InstrumentStatus.UNAVAILABLE,
        )
        Instrument.objects.create(
            installation=self.inactive,
            code="C-1",
            name="Hidden",
            status=InstrumentStatus.AVAILABLE,
        )

    def test_lists_only_active_and_available(self):
        installations = self.client.get("/api/installations/")
        self.assertEqual(installations.status_code, status.HTTP_200_OK)
        names = {row["name"] for row in installations.data}
        self.assertIn("Active Lab", names)
        self.assertNotIn("Closed Lab", names)

        instruments = self.client.get("/api/instruments/")
        self.assertEqual(instruments.status_code, status.HTTP_200_OK)
        codes = {row["code"] for row in instruments.data}
        self.assertEqual(codes, {"A-1"})

        filtered = self.client.get(
            f"/api/instruments/?installation={self.active.id}"
        )
        self.assertEqual(len(filtered.data), 1)

    def test_rejects_unavailable_instrument_on_experiment(self):
        project = make_project(self.user)
        project.status = ProjectStatus.DRAFT
        project.save(update_fields=["status"])
        busy = Instrument.objects.get(code="A-2")
        response = self.client.post(
            f"/api/projects/{project.id}/experiments/",
            {
                "kind": ExperimentKind.PLANNED,
                "instrument": busy.id,
                "scheduled_date": "2030-06-01T12:00:00Z",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
