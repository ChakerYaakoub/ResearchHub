"""Publications linked to a research project."""

from django.db import models

from projects.models import ResearchProject


class PublicationKind(models.TextChoices):
    """EXISTING = prior/related work; RESULTING = from this project's work."""

    EXISTING = "EXISTING", "Existing"
    RESULTING = "RESULTING", "Resulting"


class Publication(models.Model):
    project = models.ForeignKey(
        ResearchProject,
        on_delete=models.CASCADE,
        related_name="publications",
    )
    kind = models.CharField(
        max_length=20,
        choices=PublicationKind.choices,
        default=PublicationKind.EXISTING,
    )
    title = models.CharField(max_length=255)
    authors = models.TextField()
    journal = models.CharField(max_length=255, blank=True)
    doi = models.CharField(max_length=255, blank=True)
    publication_date = models.DateField(null=True, blank=True)
    url = models.URLField(blank=True)

    class Meta:
        ordering = ["-publication_date", "title"]
        indexes = [
            models.Index(
                fields=["-publication_date"],
                name="publications_pub_date_idx",
            ),
        ]

    def __str__(self) -> str:
        return self.title
