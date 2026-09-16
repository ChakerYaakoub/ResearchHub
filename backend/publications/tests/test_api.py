"""Publication API authz and workflow gate tests."""

from django.test import TestCase
from rest_framework import status

from projects.models import MembershipRole, ProjectStatus
from test_helpers import add_member, auth_client, make_project, make_user


class PublicationApiTests(TestCase):
    def setUp(self):
        self.owner = make_user("owner@example.com")
        self.viewer = make_user("viewer@example.com")
        self.outsider = make_user("outsider@example.com")
        self.project = make_project(self.owner)
        self.project.status = ProjectStatus.IN_PROGRESS
        self.project.save(update_fields=["status"])
        add_member(self.project, self.viewer, MembershipRole.VIEWER)
        self.owner_client = auth_client(self.owner)
        self.payload = {
            "title": "Paper",
            "authors": "A, B",
            "journal": "Nature",
            "doi": "10.1/xyz",
        }

    def test_member_read_editor_write(self):
        created = self.owner_client.post(
            f"/api/projects/{self.project.id}/publications/",
            self.payload,
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        pub_id = created.data["id"]

        viewer = auth_client(self.viewer)
        listed = viewer.get(f"/api/projects/{self.project.id}/publications/")
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        self.assertEqual(len(listed.data), 1)

        denied = viewer.post(
            f"/api/projects/{self.project.id}/publications/",
            self.payload,
            format="json",
        )
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        detail = viewer.get(f"/api/publications/{pub_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)

    def test_outsider_404(self):
        created = self.owner_client.post(
            f"/api/projects/{self.project.id}/publications/",
            self.payload,
            format="json",
        )
        outsider = auth_client(self.outsider)
        response = outsider.get(f"/api/publications/{created.data['id']}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_blocked_while_draft(self):
        draft = make_project(self.owner, title="Draft pubs")
        response = self.owner_client.post(
            f"/api/projects/{draft.id}/publications/",
            self.payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("IN_PROGRESS", response.data["detail"])

    def test_create_blocked_while_approved_only(self):
        approved = make_project(self.owner, title="Approved only")
        approved.status = ProjectStatus.APPROVED
        approved.save(update_fields=["status"])
        response = self.owner_client.post(
            f"/api/projects/{approved.id}/publications/",
            self.payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_allowed_when_completed(self):
        done = make_project(self.owner, title="Done")
        done.status = ProjectStatus.COMPLETED
        done.save(update_fields=["status"])
        response = self.owner_client.post(
            f"/api/projects/{done.id}/publications/",
            self.payload,
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
