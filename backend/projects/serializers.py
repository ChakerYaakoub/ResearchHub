"""Serializers for research projects."""

from rest_framework import serializers

from .models import ResearchProject


class ResearchProjectSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = ResearchProject
        fields = (
            "id",
            "title",
            "description",
            "scientific_objective",
            "status",
            "owner",
            "owner_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner", "status", "created_at", "updated_at")
