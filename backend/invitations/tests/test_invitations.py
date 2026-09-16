"""Invitation API tests."""

from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework import status

from invitations.models import Invitation, InvitationStatus
from projects.models import MembershipRole, ProjectMembership
from test_helpers import auth_client, make_project, make_user


class InvitationApiTests(TestCase):
    def setUp(self):
        self.owner = make_user("owner@example.com")
        self.invitee = make_user("invitee@example.com")
        self.outsider = make_user("outsider@example.com")
        self.project = make_project(self.owner)
        self.owner_client = auth_client(self.owner)

    def _create_invite(self, email="invitee@example.com", role="EDITOR"):
        response = self.owner_client.post(
            f"/api/projects/{self.project.id}/invitations/",
            {"email": email, "role": role},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        return response.data

    def test_create_pending_no_membership_has_token(self):
        data = self._create_invite()
        self.assertEqual(data["status"], InvitationStatus.PENDING)
        self.assertIn("token", data)
        self.assertFalse(
            ProjectMembership.objects.filter(
                project=self.project, user=self.invitee
            ).exists()
        )

    def test_project_list_omits_token(self):
        self._create_invite()
        listed = self.owner_client.get(
            f"/api/projects/{self.project.id}/invitations/"
        )
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        self.assertEqual(len(listed.data), 1)
        self.assertNotIn("token", listed.data[0])

    def test_outsider_project_invites_404(self):
        client = auth_client(self.outsider)
        response = client.get(f"/api/projects/{self.project.id}/invitations/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_wrong_email_accept_rejected(self):
        data = self._create_invite()
        wrong = auth_client(self.outsider)
        response = wrong.post(f"/api/invitations/{data['token']}/accept/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_accept_creates_membership(self):
        data = self._create_invite(role="EDITOR")
        client = auth_client(self.invitee)
        response = client.post(f"/api/invitations/{data['token']}/accept/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], InvitationStatus.ACCEPTED)
        membership = ProjectMembership.objects.get(
            project=self.project, user=self.invitee
        )
        self.assertEqual(membership.role, MembershipRole.EDITOR)

    def test_double_accept_rejected(self):
        data = self._create_invite()
        client = auth_client(self.invitee)
        client.post(f"/api/invitations/{data['token']}/accept/")
        again = client.post(f"/api/invitations/{data['token']}/accept/")
        self.assertEqual(again.status_code, status.HTTP_400_BAD_REQUEST)

    def test_decline_no_membership(self):
        data = self._create_invite(email="invitee@example.com", role="VIEWER")
        client = auth_client(self.invitee)
        response = client.post(f"/api/invitations/{data['token']}/decline/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], InvitationStatus.DECLINED)
        self.assertFalse(
            ProjectMembership.objects.filter(
                project=self.project, user=self.invitee
            ).exists()
        )

    def test_cancel_pending(self):
        data = self._create_invite(email="temp@example.com")
        deleted = self.owner_client.delete(
            f"/api/projects/{self.project.id}/invitations/{data['id']}/"
        )
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Invitation.objects.filter(pk=data["id"]).exists())

    def test_expired_accept_marks_expired(self):
        data = self._create_invite(email="invitee@example.com")
        Invitation.objects.filter(pk=data["id"]).update(
            expires_at=timezone.now() - timedelta(hours=1)
        )
        client = auth_client(self.invitee)
        response = client.post(f"/api/invitations/{data['token']}/accept/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        inv = Invitation.objects.get(pk=data["id"])
        self.assertEqual(inv.status, InvitationStatus.EXPIRED)

    def test_my_invitations_only_own_email(self):
        self._create_invite(email="invitee@example.com")
        self._create_invite(email="outsider@example.com")
        mine = auth_client(self.invitee).get("/api/invitations/")
        self.assertEqual(mine.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mine.data), 1)
        self.assertEqual(mine.data[0]["email"], "invitee@example.com")
        self.assertIn("token", mine.data[0])
        self.assertTrue(mine.data[0]["token"])

    def test_duplicate_pending_rejected(self):
        self._create_invite(email="dup@example.com")
        again = self.owner_client.post(
            f"/api/projects/{self.project.id}/invitations/",
            {"email": "dup@example.com", "role": "VIEWER"},
            format="json",
        )
        self.assertEqual(again.status_code, status.HTTP_400_BAD_REQUEST)
