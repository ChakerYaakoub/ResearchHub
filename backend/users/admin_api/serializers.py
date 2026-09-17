"""Admin-panel user serializers (admin-ui Origin + platform ADMIN)."""

from rest_framework import serializers

from users.models import GlobalRole, User
from users.user_create import (
    normalize_unique_email,
    unique_username_from_email,
    validate_user_password,
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
    """SUPER_ADMIN creates an ADMIN account (not promote researchers)."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    username = serializers.CharField(required=False, allow_blank=True, max_length=150)

    def validate_email(self, value: str) -> str:
        return normalize_unique_email(value)

    def validate_password(self, value: str) -> str:
        return validate_user_password(value)

    def create(self, validated_data: dict) -> User:
        email = validated_data["email"]
        username = unique_username_from_email(email, validated_data.get("username"))
        user = User(
            email=email,
            username=username,
            role=GlobalRole.ADMIN,
            is_staff=True,
        )
        user.set_password(validated_data["password"])
        user.save()
        return user
