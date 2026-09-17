"""Admin-panel invitation serializers (admin-ui Origin + platform ADMIN)."""

from rest_framework import serializers

from invitations.models import Invitation


class AdminInvitationSerializer(serializers.ModelSerializer):
    """Admin invitation row — never includes token."""

    project_title = serializers.CharField(source="project.title", read_only=True)
    invited_by_email = serializers.EmailField(source="invited_by.email", read_only=True)

    class Meta:
        model = Invitation
        fields = (
            "id",
            "project",
            "project_title",
            "email",
            "invited_by",
            "invited_by_email",
            "role",
            "status",
            "expires_at",
            "created_at",
            "accepted_at",
        )
        read_only_fields = fields
