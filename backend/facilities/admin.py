"""Django admin for installations and instruments (facility catalog)."""

from django.contrib import admin

from .models import Installation, Instrument


@admin.register(Installation)
class InstallationAdmin(admin.ModelAdmin):
    """Staff admin for scientific installations / facilities."""

    list_display = ("name", "location", "status", "updated_at")
    list_filter = ("status",)
    search_fields = ("name", "location")


@admin.register(Instrument)
class InstrumentAdmin(admin.ModelAdmin):
    """Staff admin for instruments within an installation."""

    list_display = ("code", "name", "installation", "technique", "status")
    list_filter = ("status", "installation")
    search_fields = ("code", "name", "technique")
