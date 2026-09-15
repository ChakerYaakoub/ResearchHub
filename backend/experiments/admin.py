"""Django admin for experiments."""

from django.contrib import admin

from .models import Experiment


@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    list_display = ("instrument", "project", "scheduled_date", "status")
    list_filter = ("status",)
    search_fields = ("instrument", "project__title", "notes")
    autocomplete_fields = ("project",)
