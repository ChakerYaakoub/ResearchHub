"""Auth and user serializers for `/api/auth/`."""

from django.contrib.auth import authenticate
from rest_framework import serializers

from core.validation import validate_person_name, validate_username
from users.mail import send_registration_welcome_email
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

    def validate_username(self, value: str) -> str:
        if not (value or "").strip():
            return ""
        return validate_username(value)

    def validate_first_name(self, value: str) -> str:
        return validate_person_name(value, allow_blank=True)

    def validate_last_name(self, value: str) -> str:
        return validate_person_name(value, allow_blank=True)

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
        send_registration_welcome_email(user)
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


class MeUpdateSerializer(serializers.Serializer):
    """PATCH current user: profile fields and optional password change."""

    username = serializers.CharField(required=False, max_length=150)
    first_name = serializers.CharField(
        required=False, allow_blank=True, max_length=150
    )
    last_name = serializers.CharField(
        required=False, allow_blank=True, max_length=150
    )
    current_password = serializers.CharField(
        required=False, allow_blank=True, write_only=True, style={"input_type": "password"}
    )
    new_password = serializers.CharField(
        required=False, allow_blank=True, write_only=True, style={"input_type": "password"}
    )

    def validate_username(self, value: str) -> str:
        return validate_username(value)

    def validate_first_name(self, value: str) -> str:
        return validate_person_name(value, allow_blank=True)

    def validate_last_name(self, value: str) -> str:
        return validate_person_name(value, allow_blank=True)

    def validate(self, attrs: dict) -> dict:
        if "email" in self.initial_data:
            raise serializers.ValidationError(
                {"email": "Email cannot be changed."}
            )

        user: User = self.context["request"].user
        new_password = (attrs.get("new_password") or "").strip()
        current_password = attrs.get("current_password") or ""

        if new_password:
            if not current_password:
                raise serializers.ValidationError(
                    {"current_password": "Current password is required."}
                )
            if not user.check_password(current_password):
                raise serializers.ValidationError(
                    {"current_password": "Current password is incorrect."}
                )
            attrs["new_password"] = validate_user_password(new_password)
        else:
            attrs.pop("new_password", None)
            attrs.pop("current_password", None)

        username = attrs.get("username")
        if username is not None:
            if (
                User.objects.filter(username__iexact=username)
                .exclude(pk=user.pk)
                .exists()
            ):
                raise serializers.ValidationError(
                    {"username": "This username is already taken."}
                )

        return attrs

    def update(self, instance: User, validated_data: dict) -> User:
        if "username" in validated_data:
            instance.username = validated_data["username"]
        if "first_name" in validated_data:
            instance.first_name = validated_data["first_name"]
        if "last_name" in validated_data:
            instance.last_name = validated_data["last_name"]

        new_password = validated_data.get("new_password")
        if new_password:
            instance.set_password(new_password)

        instance.save()
        return instance


class PasswordResetRequestSerializer(serializers.Serializer):
    """Request a password-reset email (always succeeds from the client view)."""

    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        return value.lower().strip()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Confirm reset with uid + token from the email deep link."""

    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )

    def validate_new_password(self, value: str) -> str:
        return validate_user_password(value)

    def validate(self, attrs: dict) -> dict:
        from django.contrib.auth.tokens import PasswordResetTokenGenerator
        from django.utils.encoding import force_str
        from django.utils.http import urlsafe_base64_decode

        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as exc:
            raise serializers.ValidationError(
                {"token": "Invalid or expired reset link."}
            ) from exc

        if not user.is_active:
            raise serializers.ValidationError(
                {"token": "Invalid or expired reset link."}
            )

        if not PasswordResetTokenGenerator().check_token(user, attrs["token"]):
            raise serializers.ValidationError(
                {"token": "Invalid or expired reset link."}
            )

        attrs["user"] = user
        return attrs

    def save(self, **kwargs) -> User:
        user: User = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user
