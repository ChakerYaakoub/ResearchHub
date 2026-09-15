"""Publications linked to a research project."""

from django.db import models

from projects.models import ResearchProject


class Publication(models.Model):
    project = models.ForeignKey(
        ResearchProject,
        on_delete=models.CASCADE,
        related_name="publications",
    )
    title = models.CharField(max_length=255)
    authors = models.TextField()
    journal = models.CharField(max_length=255, blank=True)
    doi = models.CharField(max_length=255, blank=True)
    publication_date = models.DateField(null=True, blank=True)
    url = models.URLField(blank=True)

    class Meta:
        ordering = ["-publication_date", "title"]

    def __str__(self) -> str:
        return self.title
