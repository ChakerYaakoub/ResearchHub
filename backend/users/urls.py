"""Auth routes under `/api/auth/` and admin user routes under `/api/admin/`."""

from django.urls import path

from users.admin_api.views import (
    AdminAdminListView,
    AdminUserDetailView,
    AdminUserListView,
)
from users.api.views import (
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RefreshView,
    RegisterView,
)

auth_urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("refresh/", RefreshView.as_view(), name="auth-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path(
        "password-reset/",
        PasswordResetRequestView.as_view(),
        name="auth-password-reset",
    ),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="auth-password-reset-confirm",
    ),
]

admin_urlpatterns = [
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path(
        "admin/users/<uuid:user_id>/",
        AdminUserDetailView.as_view(),
        name="admin-user-detail",
    ),
    path("admin/admins/", AdminAdminListView.as_view(), name="admin-admins"),
]

urlpatterns = auth_urlpatterns + admin_urlpatterns
