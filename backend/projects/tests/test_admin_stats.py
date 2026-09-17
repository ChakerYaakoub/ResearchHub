"""Admin stats Origin + role gate tests."""

from django.test import TestCase, override_settings
from rest_framework import status

from test_helpers import admin_client, auth_client, make_admin, make_user


@override_settings(ADMIN_UI_ORIGINS=["http://localhost:5175"])
class AdminStatsTests(TestCase):
    """``/api/admin/stats/`` requires platform admin JWT + admin-ui Origin."""
    def test_admin_with_origin_ok(self):
        admin = make_admin()
        client = admin_client(admin)
        response = client.get("/api/admin/stats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_projects", response.data)
        self.assertIn("pending_invitations", response.data)

    def test_admin_without_origin_denied(self):
        admin = make_admin()
        client = auth_client(admin)
        response = client.get("/api/admin/stats/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_researcher_with_origin_denied(self):
        user = make_user("res@example.com")
        client = admin_client(user)
        response = client.get("/api/admin/stats/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_denied(self):
        from rest_framework.test import APIClient

        response = APIClient().get(
            "/api/admin/stats/",
            HTTP_ORIGIN="http://localhost:5175",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
