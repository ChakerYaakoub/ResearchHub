"""Serializers for proposals."""

from rest_framework import serializers

from .models import Proposal


class ProposalSerializer(serializers.ModelSerializer):
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


class ProposalReviewSerializer(serializers.Serializer):
    """Optional comment body for approve/reject."""

    review_comment = serializers.CharField(required=False, allow_blank=True, default="")
