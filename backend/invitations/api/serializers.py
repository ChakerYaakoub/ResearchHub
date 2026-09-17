"""Invitation serializers — tokens only on create response."""

from rest_framework import serializers

from invitations.models import Invitation, InvitationRole


class InvitationCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=InvitationRole.choices)

    def validate_email(self, value: str) -> str:
        return value.lower().strip()


class InvitationListSerializer(serializers.ModelSerializer):
    """Project/user lists — never include token."""

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


class InvitationCreatedSerializer(InvitationListSerializer):
    """Create response — includes token once for inviter copy-link."""

    class Meta(InvitationListSerializer.Meta):
        fields = InvitationListSerializer.Meta.fields + ("token",)
        read_only_fields = fields


class MyInvitationSerializer(InvitationListSerializer):
    """Invitee list — includes token so accept/decline UI can call token URLs."""

    class Meta(InvitationListSerializer.Meta):
        fields = InvitationListSerializer.Meta.fields + ("token",)
        read_only_fields = fields
