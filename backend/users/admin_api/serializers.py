"""Admin-panel user serializers (admin-ui Origin + platform ADMIN)."""

from rest_framework import serializers

from core.validation import validate_username
from users.mail import send_admin_welcome_email
from users.models import GlobalRole, User
from users.user_create import (
    generate_temporary_password,
    normalize_unique_email,
    unique_username_from_email,
)


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "role",
            "is_active",
            "date_joined",
        )
        read_only_fields = ("id", "email", "username", "date_joined")


class AdminUserPatchSerializer(serializers.Serializer):
    """Activate/deactivate only — roles are set at create (admins) or register."""

    is_active = serializers.BooleanField(required=True)


class AdminCreateAdminSerializer(serializers.Serializer):
    """SUPER_ADMIN creates an ADMIN; password is generated and emailed."""

    email = serializers.EmailField()
    username = serializers.CharField(required=False, allow_blank=True, max_length=150)

    def validate_email(self, value: str) -> str:
        return normalize_unique_email(value)

    def validate_username(self, value: str) -> str:
        if not (value or "").strip():
            return ""
        return validate_username(value)

    def create(self, validated_data: dict) -> User:
        email = validated_data["email"]
        username = unique_username_from_email(email, validated_data.get("username"))
        plain_password = generate_temporary_password(8)
        user = User(
            email=email,
            username=username,
            role=GlobalRole.ADMIN,
            is_staff=True,
        )
        user.set_password(plain_password)
        user.save()

        if not send_admin_welcome_email(user, plain_password):
            user.delete()
            raise serializers.ValidationError(
                "Could not send credentials email. Admin was not created."
            )
        return user
