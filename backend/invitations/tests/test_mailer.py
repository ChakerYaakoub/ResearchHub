"""Invitation email outbox tests (Phase 14)."""

from unittest.mock import patch

from django.core import mail
from django.test import TestCase, override_settings
from rest_framework import status

from invitations.models import Invitation
from test_helpers import auth_client, make_project, make_user


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    CLIENT_UI_ORIGIN="http://client.test",
)
class InvitationMailerTests(TestCase):
    """Invitation email content (login vs register link) and SMTP-failure resilience."""

    def setUp(self):
        self.owner = make_user("owner@example.com")
        self.existing = make_user("existing@example.com")
        self.project = make_project(self.owner, title="Alpha Beamline")
        self.owner_client = auth_client(self.owner)

    def _create_invite(self, email: str, role="EDITOR"):
        """Create invitation and return response data (asserts 201)."""
        response = self.owner_client.post(
            f"/api/projects/{self.project.id}/invitations/",
            {"email": email, "role": role},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        return response.data

    def test_new_email_gets_register_link_and_token(self):
        data = self._create_invite("newbie@example.com")
        self.assertEqual(len(mail.outbox), 1)
        message = mail.outbox[0]
        self.assertIn("newbie@example.com", message.to)
        self.assertIn("Alpha Beamline", message.subject)
        self.assertIn("auth=register", message.body)
        self.assertIn(f"token={data['token']}", message.body)
        self.assertIn("http://client.test/?", message.body)
        self.assertIn("register with this email", message.body.lower())
        self.assertIn("Do not reply", message.body)

    def test_existing_user_gets_login_link_and_token(self):
        data = self._create_invite("existing@example.com")
        self.assertEqual(len(mail.outbox), 1)
        message = mail.outbox[0]
        self.assertIn("auth=login", message.body)
        self.assertIn(f"token={data['token']}", message.body)
        self.assertIn("log in with this email", message.body.lower())
        self.assertNotIn("auth=register", message.body)

    def test_send_failure_still_creates_invitation(self):
        with patch(
            "core.mail.send_mail",
            side_effect=OSError("smtp down"),
        ):
            data = self._create_invite("still-created@example.com")
        self.assertTrue(Invitation.objects.filter(pk=data["id"]).exists())
        self.assertEqual(len(mail.outbox), 0)
