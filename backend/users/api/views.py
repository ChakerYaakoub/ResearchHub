"""Auth API views: register, login, logout, me, refresh (SimpleJWT)."""

from django.conf import settings
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from core.ratelimit import RatelimitedAPIView
from users.api.serializers import (
    LoginSerializer,
    MeUpdateSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)
from users.mail import send_password_reset_email
from users.models import User


def _auth_rate(group, request):
    """Login/register limit from env (`AUTH_RATE_LIMIT`)."""
    return settings.AUTH_RATE_LIMIT


def _password_reset_rate(group, request):
    """Password-reset limit from env (`PASSWORD_RESET_RATE_LIMIT`)."""
    return settings.PASSWORD_RESET_RATE_LIMIT


def _tokens_for_user(user) -> dict:
    """Issue access + refresh JWTs for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


@method_decorator(
    ratelimit(key="ip", rate=_auth_rate, method="POST", block=True),
    name="post",
)
class RegisterView(RatelimitedAPIView):
    """POST `/api/auth/register/` — create researcher + JWT pair."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {**_tokens_for_user(user), "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


@method_decorator(
    ratelimit(key="ip", rate=_auth_rate, method="POST", block=True),
    name="post",
)
class LoginView(RatelimitedAPIView):
    """POST `/api/auth/login/` — email/password → access + refresh."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        return Response({**_tokens_for_user(user), "user": UserSerializer(user).data})


class LogoutView(APIView):
    """POST `/api/auth/logout/` — blacklist refresh token (body: { refresh })."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """GET/PATCH `/api/auth/me/` — current authenticated user profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = MeUpdateSerializer(
            instance=request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data)


class RefreshView(TokenRefreshView):
    """POST `/api/auth/refresh/` — body: { refresh } → new access (and rotated refresh)."""

    permission_classes = [AllowAny]


@method_decorator(
    ratelimit(key="ip", rate=_password_reset_rate, method="POST", block=True),
    name="post",
)
class PasswordResetRequestView(RatelimitedAPIView):
    """POST `/api/auth/password-reset/` — email a reset link if the account exists."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is not None:
            from django.contrib.auth.tokens import PasswordResetTokenGenerator
            from django.utils.encoding import force_bytes
            from django.utils.http import urlsafe_base64_encode

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)
            send_password_reset_email(user, uid, token)
        return Response(
            {
                "detail": (
                    "If an account exists for this email, "
                    "a password reset link has been sent."
                )
            }
        )


@method_decorator(
    ratelimit(key="ip", rate=_password_reset_rate, method="POST", block=True),
    name="post",
)
class PasswordResetConfirmView(RatelimitedAPIView):
    """POST `/api/auth/password-reset/confirm/` — set a new password from the email link."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password has been reset. You can log in."})
