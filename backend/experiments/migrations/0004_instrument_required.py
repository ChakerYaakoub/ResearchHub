# Step 2: require FK and drop legacy free-text column (separate txn for Postgres).

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("experiments", "0003_instrument_fk"),
        ("facilities", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="experiment",
            name="instrument",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="experiments",
                to="facilities.instrument",
            ),
        ),
        migrations.RemoveField(
            model_name="experiment",
            name="instrument_label",
        ),
    ]
