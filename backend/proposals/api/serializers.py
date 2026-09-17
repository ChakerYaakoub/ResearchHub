"""Serializers for proposals."""

from rest_framework import serializers

from core.validation import validate_optional_text
from proposals.models import Proposal


class ProposalSerializer(serializers.ModelSerializer):
    """Client proposal body — status/timestamps/review fields are workflow-owned (read-only)."""

    class Meta:
        model = Proposal
        fields = (
            "id",
            "project",
            "methodology",
            "expected_results",
            "submitted_at",
            "reviewed_at",
            "review_comment",
            "status",
        )
        read_only_fields = (
            "id",
            "project",
            "submitted_at",
            "reviewed_at",
            "review_comment",
            "status",
        )

    def validate_methodology(self, value: str) -> str:
        return validate_optional_text(value)

    def validate_expected_results(self, value: str) -> str:
        return validate_optional_text(value)


class ProposalReviewSerializer(serializers.Serializer):
    """Optional comment body for approve/reject."""

    review_comment = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_review_comment(self, value: str) -> str:
        return validate_optional_text(value)


class AdminPendingProposalSerializer(serializers.ModelSerializer):
    """Admin review queue — includes project title for the UI."""

    project_title = serializers.CharField(source="project.title", read_only=True)

    class Meta:
        model = Proposal
        fields = (
            "id",
            "project",
            "project_title",
            "methodology",
            "expected_results",
            "submitted_at",
            "status",
        )
        read_only_fields = fields
