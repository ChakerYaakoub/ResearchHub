"""Serializers for installation / instrument catalog."""

from rest_framework import serializers

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
