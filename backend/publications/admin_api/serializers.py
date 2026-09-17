"""Admin-panel publication serializers (admin-ui Origin + platform ADMIN)."""

from rest_framework import serializers

from publications.models import Publication


class AdminPublicationSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)

    class Meta:
        model = Publication
        fields = (
            "id",
            "project",
            "project_title",
            "kind",
            "title",
            "authors",
            "journal",
            "doi",
            "publication_date",
            "url",
        )
        read_only_fields = fields
