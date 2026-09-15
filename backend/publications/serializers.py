"""Serializers for publications."""

from rest_framework import serializers

from .models import Publication


class PublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = (
            "id",
            "project",
            "title",
            "authors",
            "journal",
            "doi",
            "publication_date",
            "url",
        )
        read_only_fields = ("id", "project")
