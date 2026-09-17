"""Serializers for research projects and collaborators."""

from rest_framework import serializers

from core.validation import validate_optional_text, validate_title
from projects.models import ProjectMembership, ResearchProject


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

    def validate_title(self, value: str) -> str:
        return validate_title(value)

    def validate_description(self, value: str) -> str:
        return validate_optional_text(value)

    def validate_scientific_objective(self, value: str) -> str:
        return validate_optional_text(value)


class ProjectMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = ProjectMembership
        fields = ("id", "project", "user", "user_email", "role", "created_at")
        read_only_fields = fields
