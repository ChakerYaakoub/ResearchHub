"""Auth and user serializers for `/api/auth/`."""

from django.contrib.auth import authenticate
from rest_framework import serializers

from users.models import GlobalRole, User
from users.user_create import (
    normalize_unique_email,
    unique_username_from_email,
    validate_user_password,
)


class UserSerializer(serializers.ModelSerializer):
    """Public user payload (never includes password)."""

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
        )
        read_only_fields = fields


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    username = serializers.CharField(required=False, allow_blank=True, max_length=150)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)

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
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=GlobalRole.RESEARCHER,
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs: dict) -> dict:
        email = attrs["email"].lower().strip()
        password = attrs["password"]
        user = authenticate(
            request=self.context.get("request"),
            username=email,  # USERNAME_FIELD is email
            password=password,
        )
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is disabled.")
        attrs["user"] = user
        return attrs
