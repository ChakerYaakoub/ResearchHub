"""Experiment API authz and workflow gate tests."""

from django.test import TestCase, override_settings
from rest_framework import status

from projects.models import MembershipRole, ProjectStatus
from test_helpers import (
    add_member,
    admin_client,
    auth_client,
    make_admin,
    make_project,
    make_user,
)


class ExperimentApiTests(TestCase):
    def setUp(self):
        self.owner = make_user("owner@example.com")
        self.viewer = make_user("viewer@example.com")
        self.outsider = make_user("outsider@example.com")
        self.project = make_project(self.owner)
        self.project.status = ProjectStatus.APPROVED
        self.project.save(update_fields=["status"])
        add_member(self.project, self.viewer, MembershipRole.VIEWER)
        self.owner_client = auth_client(self.owner)
        self.payload = {
            "instrument": "BL-1",
            "scheduled_date": "2030-06-01T12:00:00Z",
            "notes": "n",
        }

    def test_member_read_editor_write(self):
        created = self.owner_client.post(
            f"/api/projects/{self.project.id}/experiments/",
            self.payload,
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        exp_id = created.data["id"]
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.IN_PROGRESS)

        viewer = auth_client(self.viewer)
        listed = viewer.get(f"/api/projects/{self.project.id}/experiments/")
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        self.assertEqual(len(listed.data), 1)

        denied = viewer.post(
            f"/api/projects/{self.project.id}/experiments/",
            self.payload,
            format="json",
        )
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        detail = viewer.get(f"/api/experiments/{exp_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)

    def test_outsider_404(self):
        created = self.owner_client.post(
            f"/api/projects/{self.project.id}/experiments/",
            self.payload,
            format="json",
        )
        outsider = auth_client(self.outsider)
        response = outsider.get(f"/api/experiments/{created.data['id']}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_blocked_while_draft(self):
        draft = make_project(self.owner, title="Still draft")
        response = self.owner_client.post(
            f"/api/projects/{draft.id}/experiments/",
            self.payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("APPROVED", response.data["detail"])


@override_settings(ADMIN_UI_ORIGINS=["http://localhost:5175"])
class ExperimentAfterApproveTests(TestCase):
    def setUp(self):
        self.owner = make_user("eowner@example.com")
        self.admin = make_admin("eadmin@example.com")
        self.project = make_project(self.owner)
        self.owner_client = auth_client(self.owner)
        self.admin_api = admin_client(self.admin)

    def test_experiment_allowed_after_approve(self):
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
        approved = self.admin_api.post(
            f"/api/proposals/{submitted.data['id']}/approve/",
            {},
            format="json",
        )
        self.assertEqual(approved.status_code, status.HTTP_200_OK)

        response = self.owner_client.post(
            f"/api/projects/{self.project.id}/experiments/",
            {
                "instrument": "BL-2",
                "scheduled_date": "2030-07-01T10:00:00Z",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
