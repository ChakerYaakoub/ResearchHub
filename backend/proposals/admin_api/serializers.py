"""Admin-panel proposal serializers (admin-ui Origin + platform ADMIN)."""

from rest_framework import serializers

from proposals.models import Proposal


class AdminProposalSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)
    project_status = serializers.CharField(source="project.status", read_only=True)

    class Meta:
        model = Proposal
        fields = (
            "id",
            "project",
            "project_title",
            "project_status",
            "methodology",
            "expected_results",
            "submitted_at",
            "reviewed_at",
            "review_comment",
            "status",
        )
        read_only_fields = fields
