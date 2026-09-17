"""Admin-panel user serializers (admin-ui Origin + platform ADMIN)."""

from rest_framework import serializers

from users.models import GlobalRole, User


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
        email = value.lower().strip()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_password(self, value: str) -> str:
        from django.contrib.auth.password_validation import validate_password

        validate_password(value)
        return value

    def create(self, validated_data: dict) -> User:
        email = validated_data["email"]
        username = validated_data.get("username") or email.split("@")[0]
        base = username
        suffix = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{suffix}"
            suffix += 1
        user = User(
            email=email,
            username=username,
            role=GlobalRole.ADMIN,
            is_staff=True,
        )
        user.set_password(validated_data["password"])
        user.save()
        return user
