# Step 1: rename free-text field, add nullable FK, backfill instruments.

import django.db.models.deletion
from django.db import migrations, models


def forwards_map_instruments(apps, schema_editor):
    Experiment = apps.get_model("experiments", "Experiment")
    Installation = apps.get_model("facilities", "Installation")
    Instrument = apps.get_model("facilities", "Instrument")

    installation, _ = Installation.objects.get_or_create(
        name="Migrated",
        defaults={
            "description": "Auto-created for legacy free-text instruments.",
            "location": "",
            "status": "ACTIVE",
        },
    )

    labels = (
        Experiment.objects.exclude(instrument_label="")
        .values_list("instrument_label", flat=True)
        .distinct()
    )
    code_by_label: dict[str, int] = {}
    for i, label in enumerate(labels, start=1):
        code = f"LEGACY-{i:04d}"
        instrument, _ = Instrument.objects.get_or_create(
            installation=installation,
            code=code,
            defaults={
                "name": label[:255],
                "technique": "",
                "description": f"Migrated from free-text: {label}",
                "status": "AVAILABLE",
            },
        )
        code_by_label[label] = instrument.id

    for exp in Experiment.objects.all():
        label = exp.instrument_label or "Unknown"
        if label not in code_by_label:
            code = f"LEGACY-UNK-{exp.id}"
            instrument, _ = Instrument.objects.get_or_create(
                installation=installation,
                code=code,
                defaults={
                    "name": label[:255],
                    "technique": "",
                    "description": "Migrated empty/unknown instrument label.",
                    "status": "AVAILABLE",
                },
            )
            code_by_label[label] = instrument.id
        exp.instrument_id = code_by_label[label]
        exp.save(update_fields=["instrument_id"])


def backwards_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("experiments", "0002_add_kind_fields"),
        ("facilities", "0001_initial"),
    ]

    operations = [
        migrations.RenameField(
            model_name="experiment",
            old_name="instrument",
            new_name="instrument_label",
        ),
        migrations.AddField(
            model_name="experiment",
            name="instrument",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="experiments",
                to="facilities.instrument",
            ),
        ),
        migrations.RunPython(forwards_map_instruments, backwards_noop),
    ]
