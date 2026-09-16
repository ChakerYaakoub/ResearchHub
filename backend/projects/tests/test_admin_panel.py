"""Admin panel list/manage API tests."""

from django.test import TestCase, override_settings
from rest_framework import status

from experiments.models import Experiment, ExperimentStatus
from invitations.models import Invitation, InvitationRole, InvitationStatus
from publications.models import Publication
from test_helpers import (
    DEFAULT_PASSWORD,
    admin_client,
    auth_client,
    make_admin,
    make_project,
    make_super_admin,
    make_user,
)
from users.models import GlobalRole, User


@override_settings(ADMIN_UI_ORIGINS=["http://localhost:5175"])
class AdminPanelApiTests(TestCase):
    def setUp(self):
        self.owner = make_user("owner@example.com")
        self.admin = make_admin()
        self.super_admin = make_super_admin()
        self.other = make_user("other@example.com")
        self.project = make_project(self.owner, title="Beam study")
        self.admin_api = admin_client(self.admin)
        self.super_api = admin_client(self.super_admin)
        self.owner_client = auth_client(self.owner)

    def test_list_users_admin_ok_researcher_denied(self):
        ok = self.admin_api.get("/api/admin/users/")
        self.assertEqual(ok.status_code, status.HTTP_200_OK)
        emails = {row["email"] for row in ok.data}
        self.assertIn(self.admin.email, emails)
        self.assertIn(self.owner.email, emails)

        denied = admin_client(self.owner).get("/api/admin/users/")
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        no_origin = auth_client(self.admin).get("/api/admin/users/")
        self.assertEqual(no_origin.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_user_active_only_no_role_flip(self):
        patched = self.admin_api.patch(
            f"/api/admin/users/{self.other.id}/",
            {"is_active": False},
            format="json",
        )
        self.assertEqual(patched.status_code, status.HTTP_200_OK)
        self.assertFalse(patched.data["is_active"])
        self.other.refresh_from_db()
        self.assertEqual(self.other.role, GlobalRole.RESEARCHER)
        self.assertFalse(self.other.is_active)

        # Role changes via PATCH are ignored / rejected (serializer has no role).
        with_role = self.admin_api.patch(
            f"/api/admin/users/{self.other.id}/",
            {"role": GlobalRole.ADMIN, "is_active": True},
            format="json",
        )
        # Extra fields ignored by default DRF Serializer → only is_active applied if present
        # Our serializer requires is_active only; role is not a field so ignored.
        self.assertEqual(with_role.status_code, status.HTTP_200_OK)
        self.other.refresh_from_db()
        self.assertEqual(self.other.role, GlobalRole.RESEARCHER)
        self.assertTrue(self.other.is_active)

    def test_cannot_patch_self(self):
        response = self.admin_api.patch(
            f"/api/admin/users/{self.admin.id}/",
            {"is_active": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_admin_super_only(self):
        created = self.super_api.post(
            "/api/admin/users/",
            {
                "email": "newadmin@example.com",
                "password": DEFAULT_PASSWORD,
                "username": "newadmin",
            },
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data["role"], GlobalRole.ADMIN)
        self.assertEqual(created.data["email"], "newadmin@example.com")
        user = User.objects.get(email="newadmin@example.com")
        self.assertEqual(user.role, GlobalRole.ADMIN)
        self.assertTrue(user.check_password(DEFAULT_PASSWORD))

        by_admin = self.admin_api.post(
            "/api/admin/users/",
            {"email": "x@example.com", "password": DEFAULT_PASSWORD},
            format="json",
        )
        self.assertEqual(by_admin.status_code, status.HTTP_403_FORBIDDEN)

        denied = admin_client(self.owner).post(
            "/api/admin/users/",
            {"email": "y@example.com", "password": DEFAULT_PASSWORD},
            format="json",
        )
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_and_detail_projects(self):
        listed = self.admin_api.get("/api/admin/projects/")
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        self.assertTrue(any(p["id"] == self.project.id for p in listed.data))

        detail = self.admin_api.get(f"/api/admin/projects/{self.project.id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["title"], "Beam study")
        self.assertEqual(detail.data["owner_email"], self.owner.email)
        self.assertGreaterEqual(detail.data["member_count"], 1)

    def test_proposals_default_and_status_filter(self):
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

        pending = self.admin_api.get("/api/admin/proposals/?queue=review")
        self.assertEqual(pending.status_code, status.HTTP_200_OK)
        self.assertTrue(any(p["id"] == submitted.data["id"] for p in pending.data))

        all_pending = self.admin_api.get("/api/admin/proposals/?status=PENDING")
        self.assertEqual(all_pending.status_code, status.HTTP_200_OK)
        self.assertTrue(any(p["id"] == submitted.data["id"] for p in all_pending.data))

        all_rows = self.admin_api.get("/api/admin/proposals/")
        self.assertEqual(all_rows.status_code, status.HTTP_200_OK)
        self.assertTrue(any(p["id"] == submitted.data["id"] for p in all_rows.data))

    def test_experiments_publications_invitations(self):
        Experiment.objects.create(
            project=self.project,
            instrument="X-Ray",
            scheduled_date="2030-01-15T10:00:00Z",
            status=ExperimentStatus.SCHEDULED,
        )
        Publication.objects.create(
            project=self.project,
            title="Paper",
            authors="A. Author",
        )
        Invitation.objects.create(
            project=self.project,
            email="invitee@example.com",
            invited_by=self.owner,
            role=InvitationRole.EDITOR,
            status=InvitationStatus.PENDING,
        )

        exp = self.admin_api.get("/api/admin/experiments/")
        self.assertEqual(exp.status_code, status.HTTP_200_OK)
        self.assertEqual(exp.data[0]["project_title"], "Beam study")

        pubs = self.admin_api.get("/api/admin/publications/")
        self.assertEqual(pubs.status_code, status.HTTP_200_OK)
        self.assertEqual(pubs.data[0]["title"], "Paper")

        invs = self.admin_api.get("/api/admin/invitations/")
        self.assertEqual(invs.status_code, status.HTTP_200_OK)
        invite_id = invs.data[0]["id"]
        self.assertEqual(invs.data[0]["email"], "invitee@example.com")

        cancelled = self.admin_api.delete(f"/api/admin/invitations/{invite_id}/")
        self.assertEqual(cancelled.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Invitation.objects.filter(pk=invite_id).exists())

    def test_createsuperuser_sets_super_admin_role(self):
        user = User.objects.create_superuser(
            username="su",
            email="su@example.com",
            password=DEFAULT_PASSWORD,
        )
        self.assertEqual(user.role, GlobalRole.SUPER_ADMIN)
        self.assertTrue(user.is_superuser)
