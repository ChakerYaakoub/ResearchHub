"""Django admin for projects and memberships."""

from django.contrib import admin

from .models import ProjectMembership, ResearchProject


class ProjectMembershipInline(admin.TabularInline):
    model = ProjectMembership
    extra = 0
    autocomplete_fields = ("user",)


@admin.register(ResearchProject)
class ResearchProjectAdmin(admin.ModelAdmin):
    """Staff admin for projects with inline memberships."""

    list_display = ("title", "status", "owner", "created_at", "updated_at")
    list_filter = ("status",)
    search_fields = ("title", "description", "owner__email")
    autocomplete_fields = ("owner",)
    inlines = (ProjectMembershipInline,)


@admin.register(ProjectMembership)
class ProjectMembershipAdmin(admin.ModelAdmin):
    list_display = ("project", "user", "role", "created_at")
    list_filter = ("role",)
    search_fields = ("project__title", "user__email")
    autocomplete_fields = ("project", "user")
