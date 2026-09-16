# Generated manually for RESUBMITTED project status.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="researchproject",
            name="status",
            field=models.CharField(
                choices=[
                    ("DRAFT", "Draft"),
                    ("SUBMITTED", "Submitted"),
                    ("UNDER_REVIEW", "Under review"),
                    ("APPROVED", "Approved"),
                    ("REJECTED", "Rejected"),
                    ("RESUBMITTED", "Resubmitted"),
                    ("IN_PROGRESS", "In progress"),
                    ("COMPLETED", "Completed"),
                ],
                default="DRAFT",
                max_length=20,
            ),
        ),
    ]
