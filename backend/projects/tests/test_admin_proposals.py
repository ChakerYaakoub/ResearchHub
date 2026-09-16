"""Admin pending proposals list — Origin + role gate tests."""

from django.test import TestCase, override_settings
from rest_framework import status

from test_helpers import admin_client, auth_client, make_admin, make_project, make_user


@override_settings(ADMIN_UI_ORIGINS=["http://localhost:5175"])
class AdminPendingProposalsTests(TestCase):
    def setUp(self):
        self.owner = make_user("owner@example.com")
        self.admin = make_admin()
        self.project = make_project(self.owner)
        self.owner_client = auth_client(self.owner)
        self.admin_api = admin_client(self.admin)

    def _submit_proposal(self):
        created = self.owner_client.post(
            f"/api/projects/{self.project.id}/proposal/",
            {"methodology": "XAS", "expected_results": "spectra"},
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        submitted = self.owner_client.post(
            f"/api/projects/{self.project.id}/proposal/submit/"
        )
        self.assertEqual(submitted.status_code, status.HTTP_200_OK)
        return submitted.data

    def test_admin_with_origin_lists_pending(self):
        proposal = self._submit_proposal()
        response = self.admin_api.get("/api/admin/proposals/?queue=review")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = {row["id"] for row in response.data}
        self.assertIn(proposal["id"], ids)
        row = next(r for r in response.data if r["id"] == proposal["id"])
        self.assertEqual(row["project_title"], self.project.title)
        self.assertEqual(row["status"], "PENDING")

    def test_admin_without_origin_denied(self):
        client = auth_client(self.admin)
        response = client.get("/api/admin/proposals/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_researcher_with_origin_denied(self):
        client = admin_client(self.owner)
        response = client.get("/api/admin/proposals/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
