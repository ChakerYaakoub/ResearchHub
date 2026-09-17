"""Django admin for proposals."""

from django.contrib import admin

from .models import Proposal


@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    """Staff admin for proposals (review status and timestamps)."""

    list_display = ("project", "status", "submitted_at", "reviewed_at")
    list_filter = ("status",)
    search_fields = ("project__title",)
    autocomplete_fields = ("project",)
