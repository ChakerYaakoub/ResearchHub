"""Serializers for experiments."""

from rest_framework import serializers

from facilities.services import FacilityError, assert_instrument_selectable

from experiments.models import Experiment


class ExperimentSerializer(serializers.ModelSerializer):
    instrument_code = serializers.CharField(source="instrument.code", read_only=True)
    instrument_name = serializers.CharField(source="instrument.name", read_only=True)
    installation_id = serializers.IntegerField(
        source="instrument.installation_id", read_only=True
    )
    installation_name = serializers.CharField(
        source="instrument.installation.name", read_only=True
    )

    class Meta:
        model = Experiment
        fields = (
            "id",
            "project",
            "kind",
            "instrument",
            "instrument_code",
            "instrument_name",
            "installation_id",
            "installation_name",
            "scheduled_date",
            "status",
            "notes",
        )
        read_only_fields = (
            "id",
            "project",
            "instrument_code",
            "instrument_name",
            "installation_id",
            "installation_name",
        )

    def validate_instrument(self, instrument):
        # Creating always validates; updating only when instrument changes.
        instance = getattr(self, "instance", None)
        if instance is not None and instance.instrument_id == instrument.id:
            return instrument
        try:
            assert_instrument_selectable(instrument)
        except FacilityError as exc:
            raise serializers.ValidationError(exc.detail) from exc
        return instrument
