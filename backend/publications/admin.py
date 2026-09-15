"""Django admin for publications."""

from django.contrib import admin

from .models import Publication


@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "journal", "publication_date")
    search_fields = ("title", "authors", "journal", "doi", "project__title")
    autocomplete_fields = ("project",)
