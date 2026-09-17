"""Serializers for installation / instrument catalog."""

from rest_framework import serializers

from core.validation import validate_code, validate_optional_text, validate_title

from .models import Installation, Instrument


class InstallationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installation
        fields = (
            "id",
            "name",
            "description",
            "location",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_name(self, value: str) -> str:
        return validate_title(value)

    def validate_description(self, value: str) -> str:
        return validate_optional_text(value)

    def validate_location(self, value: str) -> str:
        return validate_optional_text(value, multiline=False)


class InstrumentSerializer(serializers.ModelSerializer):
    installation_name = serializers.CharField(
        source="installation.name", read_only=True
    )

    class Meta:
        model = Instrument
        fields = (
            "id",
            "installation",
            "installation_name",
            "code",
            "name",
            "technique",
            "description",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "installation_name", "created_at", "updated_at")

    def validate_code(self, value: str) -> str:
        return validate_code(value)

    def validate_name(self, value: str) -> str:
        return validate_title(value)

    def validate_technique(self, value: str) -> str:
        return validate_optional_text(value, multiline=False)

    def validate_description(self, value: str) -> str:
        return validate_optional_text(value)
