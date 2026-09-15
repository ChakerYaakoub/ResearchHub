"""Publication API authz tests."""

from django.test import TestCase
from rest_framework import status

from projects.models import MembershipRole
from test_helpers import add_member, auth_client, make_project, make_user


class PublicationApiTests(TestCase):
    def setUp(self):
        self.owner = make_user("owner@example.com")
        self.viewer = make_user("viewer@example.com")
        self.outsider = make_user("outsider@example.com")
        self.project = make_project(self.owner)
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
