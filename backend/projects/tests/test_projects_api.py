"""Project CRUD API tests."""

from django.test import TestCase
from rest_framework import status

from projects.models import MembershipRole, ProjectMembership, ResearchProject
from test_helpers import add_member, auth_client, make_project, make_user


class ProjectCrudApiTests(TestCase):
    """Create/list/update/delete and collaborator list/remove happy paths."""
    def test_create_sets_owner_and_membership(self):
        owner = make_user("owner@example.com")
        client = auth_client(owner)
        response = client.post(
            "/api/projects/",
            {"title": "Beamline study", "description": "desc"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project = ResearchProject.objects.get(pk=response.data["id"])
        self.assertEqual(project.owner_id, owner.id)
        self.assertTrue(
            ProjectMembership.objects.filter(
                project=project, user=owner, role=MembershipRole.OWNER
            ).exists()
        )

    def test_list_only_visible_projects(self):
        owner = make_user("owner@example.com")
        outsider = make_user("out@example.com")
        mine = make_project(owner, title="Mine")
        make_project(outsider, title="Theirs")
        client = auth_client(owner)
        response = client.get("/api/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = {row["id"] for row in response.data}
        self.assertIn(str(mine.id), ids)
        self.assertEqual(len(ids), 1)

    def test_retrieve_update_delete_happy_path(self):
        owner = make_user("owner@example.com")
        project = make_project(owner, title="Old")
        client = auth_client(owner)

        get_r = client.get(f"/api/projects/{project.id}/")
        self.assertEqual(get_r.status_code, status.HTTP_200_OK)
        self.assertEqual(get_r.data["title"], "Old")

        patch_r = client.patch(
            f"/api/projects/{project.id}/",
            {"title": "New"},
            format="json",
        )
        self.assertEqual(patch_r.status_code, status.HTTP_200_OK)
        project.refresh_from_db()
        self.assertEqual(project.title, "New")

        del_r = client.delete(f"/api/projects/{project.id}/")
        self.assertEqual(del_r.status_code, status.HTTP_204_NO_CONTENT)
        project.refresh_from_db()
        self.assertEqual(project.status, "SOFT_DELETED")
        listed = client.get("/api/projects/")
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        self.assertFalse(any(row["id"] == str(project.id) for row in listed.data))
        gone = client.get(f"/api/projects/{project.id}/")
        self.assertEqual(gone.status_code, status.HTTP_404_NOT_FOUND)

    def test_collaborators_list_and_remove(self):
        owner = make_user("owner@example.com")
        editor = make_user("editor@example.com")
        project = make_project(owner)
        add_member(project, editor, MembershipRole.EDITOR)
        client = auth_client(owner)

        listed = client.get(f"/api/projects/{project.id}/collaborators/")
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        user_ids = {str(row["user"]) for row in listed.data}
        self.assertIn(str(owner.id), user_ids)
        self.assertIn(str(editor.id), user_ids)

        removed = client.delete(
            f"/api/projects/{project.id}/collaborators/{editor.id}/"
        )
        self.assertEqual(removed.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            ProjectMembership.objects.filter(project=project, user=editor).exists()
        )

    def test_cannot_remove_owner_collaborator(self):
        owner = make_user("owner@example.com")
        project = make_project(owner)
        client = auth_client(owner)
        response = client.delete(
            f"/api/projects/{project.id}/collaborators/{owner.id}/"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
