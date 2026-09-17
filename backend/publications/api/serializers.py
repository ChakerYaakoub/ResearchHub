"""Serializers for publications."""

from rest_framework import serializers

from core.validation import (
    sanitize_plain_text,
    validate_optional_text,
    validate_title,
)
from publications.models import Publication


class PublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = (
            "id",
            "project",
            "kind",
            "title",
            "authors",
            "journal",
            "doi",
            "publication_date",
            "url",
        )
        read_only_fields = ("id", "project")

    def validate_title(self, value: str) -> str:
        return validate_title(value)

    def validate_authors(self, value: str) -> str:
        authors = sanitize_plain_text(value)
        if not authors:
            raise serializers.ValidationError("This field may not be blank.")
        return authors

    def validate_journal(self, value: str) -> str:
        return validate_optional_text(value, multiline=False)

    def validate_doi(self, value: str) -> str:
        doi = sanitize_plain_text(value, multiline=False)
        if doi and (" " in doi or len(doi) > 255):
            raise serializers.ValidationError("Enter a valid DOI without spaces.")
        return doi
