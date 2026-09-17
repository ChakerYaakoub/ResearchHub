"""Admin-panel experiment serializers (admin-ui Origin + platform ADMIN)."""

from rest_framework import serializers

from experiments.models import Experiment


class AdminExperimentSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)
    instrument_code = serializers.CharField(source="instrument.code", read_only=True)
    instrument_name = serializers.CharField(source="instrument.name", read_only=True)
    installation_name = serializers.CharField(
        source="instrument.installation.name", read_only=True
    )

    class Meta:
        model = Experiment
        fields = (
            "id",
            "project",
            "project_title",
            "kind",
            "instrument",
            "instrument_code",
            "instrument_name",
            "installation_name",
            "scheduled_date",
            "status",
            "notes",
        )
        read_only_fields = fields
