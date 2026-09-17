"""Serializers for research projects and collaborators."""

from rest_framework import serializers

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


class ProjectMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = ProjectMembership
        fields = ("id", "project", "user", "user_email", "role", "created_at")
        read_only_fields = fields
