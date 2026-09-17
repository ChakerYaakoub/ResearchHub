"""Authentication API tests (`/api/auth/`)."""

from django.core import mail
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from test_helpers import DEFAULT_PASSWORD, auth_client, make_user
from users.models import GlobalRole, User


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @override_settings(
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    )
    def test_register_returns_tokens_and_researcher(self):
        response = self.client.post(
            "/api/auth/register/",
            {"email": "new@example.com", "password": DEFAULT_PASSWORD},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "new@example.com")
        self.assertEqual(response.data["user"]["role"], GlobalRole.RESEARCHER)
        user = User.objects.get(email="new@example.com")
        self.assertTrue(user.check_password(DEFAULT_PASSWORD))

        self.assertEqual(len(mail.outbox), 1)
        message = mail.outbox[0]
        self.assertIn("new@example.com", message.to)
        self.assertIn(f"Dear {user.username},", message.body)
        self.assertIn("We thank you for your registration on", message.body)
        self.assertIn(f"email: {user.email}", message.body)
        self.assertIn(f"username: {user.username}", message.body)
        self.assertIn("ResearchHub User Office", message.body)
        self.assertIn("Do not reply to this email.", message.body)

    @override_settings(
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    )
    def test_register_welcome_uses_full_name_when_provided(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "named@example.com",
                "password": DEFAULT_PASSWORD,
                "first_name": "Chaker",
                "last_name": "Yaakoub",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Dear Chaker Yaakoub,", mail.outbox[0].body)

    def test_register_duplicate_email_rejected(self):
        make_user("dup@example.com")
        response = self.client.post(
            "/api/auth/register/",
            {"email": "dup@example.com", "password": DEFAULT_PASSWORD},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password_rejected(self):
        response = self.client.post(
            "/api/auth/register/",
            {"email": "weak@example.com", "password": "123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        make_user("login@example.com")
        response = self.client.post(
            "/api/auth/login/",
            {"email": "login@example.com", "password": DEFAULT_PASSWORD},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_bad_credentials(self):
        make_user("login@example.com")
        response = self.client.post(
            "/api/auth/login/",
            {"email": "login@example.com", "password": "WrongPass999!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_inactive_user_rejected(self):
        user = make_user("inactive@example.com")
        user.is_active = False
        user.save(update_fields=["is_active"])
        response = self.client.post(
            "/api/auth/login/",
            {"email": "inactive@example.com", "password": DEFAULT_PASSWORD},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_requires_auth(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user(self):
        user = make_user("me@example.com")
        client = auth_client(user)
        response = client.get("/api/auth/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "me@example.com")

    def test_refresh_issues_new_access(self):
        response = self.client.post(
            "/api/auth/register/",
            {"email": "refresh@example.com", "password": DEFAULT_PASSWORD},
            format="json",
        )
        refresh = response.data["refresh"]
        refreshed = self.client.post(
            "/api/auth/refresh/",
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(refreshed.status_code, status.HTTP_200_OK)
        self.assertIn("access", refreshed.data)

    def test_logout_blacklists_refresh(self):
        response = self.client.post(
            "/api/auth/register/",
            {"email": "logout@example.com", "password": DEFAULT_PASSWORD},
            format="json",
        )
        access = response.data["access"]
        refresh = response.data["refresh"]
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        logout = client.post("/api/auth/logout/", {"refresh": refresh}, format="json")
        self.assertEqual(logout.status_code, status.HTTP_204_NO_CONTENT)
        again = self.client.post(
            "/api/auth/refresh/",
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(again.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_without_refresh_rejected(self):
        user = make_user("norefresh@example.com")
        client = auth_client(user)
        response = client.post("/api/auth/logout/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_unauthenticated(self):
        response = self.client.post(
            "/api/auth/logout/",
            {"refresh": "dummy"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
