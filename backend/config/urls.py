"""Root URLconf — API routes arrive in Phase 3."""

from django.contrib import admin
from django.urls import path

urlpatterns = [
    path("admin/", admin.site.urls),
]
