"""Serializers for experiments."""

from rest_framework import serializers

from .models import Experiment


class ExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = (
            "id",
            "project",
            "kind",
            "instrument",
            "scheduled_date",
            "status",
            "notes",
        )
        read_only_fields = ("id", "project")
