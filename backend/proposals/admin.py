from django.contrib import admin

from .models import Proposal


@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ("project", "status", "submitted_at", "reviewed_at")
    list_filter = ("status",)
    search_fields = ("project__title",)
    autocomplete_fields = ("project",)
