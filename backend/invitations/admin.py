from django.contrib import admin

from .models import Invitation


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = (
        "email",
        "project",
        "role",
        "status",
        "invited_by",
        "expires_at",
        "created_at",
    )
    list_filter = ("status", "role")
    search_fields = ("email", "project__title", "token")
    autocomplete_fields = ("project", "invited_by")
    readonly_fields = ("token", "created_at", "accepted_at")
