"""Project authorization / IDOR tests."""

from django.test import TestCase
from rest_framework import status

from projects.models import MembershipRole
from test_helpers import add_member, auth_client, make_admin, make_project, make_user


class ProjectIdorTests(TestCase):
    def setUp(self):
        self.owner = make_user("owner@example.com")
        self.editor = make_user("editor@example.com")
        self.viewer = make_user("viewer@example.com")
        self.outsider = make_user("outsider@example.com")
        self.admin = make_admin("padmin@example.com")
        self.project = make_project(self.owner, title="Secret")
        add_member(self.project, self.editor, MembershipRole.EDITOR)
        add_member(self.project, self.viewer, MembershipRole.VIEWER)

    def test_outsider_retrieve_404(self):
        client = auth_client(self.outsider)
        response = client.get(f"/api/projects/{self.project.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_viewer_can_read_not_write(self):
        client = auth_client(self.viewer)
        ok = client.get(f"/api/projects/{self.project.id}/")
        self.assertEqual(ok.status_code, status.HTTP_200_OK)
        denied = client.patch(
            f"/api/projects/{self.project.id}/",
            {"title": "Hacked"},
            format="json",
        )
        self.assertIn(denied.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND))

    def test_editor_can_update_not_delete(self):
        client = auth_client(self.editor)
        patched = client.patch(
            f"/api/projects/{self.project.id}/",
            {"title": "Edited"},
            format="json",
        )
        self.assertEqual(patched.status_code, status.HTTP_200_OK)
        deleted = client.delete(f"/api/projects/{self.project.id}/")
        self.assertEqual(deleted.status_code, status.HTTP_403_FORBIDDEN)

    def test_editor_cannot_manage_invites(self):
        client = auth_client(self.editor)
        response = client.post(
            f"/api/projects/{self.project.id}/invitations/",
            {"email": "x@example.com", "role": "VIEWER"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_platform_admin_sees_all_projects(self):
        client = auth_client(self.admin)
        response = client.get("/api/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = {row["id"] for row in response.data}
        self.assertIn(self.project.id, ids)

    def test_outsider_collaborators_404(self):
        client = auth_client(self.outsider)
        response = client.get(f"/api/projects/{self.project.id}/collaborators/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
