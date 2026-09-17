"""Aggregate `/api/` URL includes for ResearchHub domain apps.

Mounted at `/api/` from `config.urls`. Auth and admin user routes come from
`users`; remaining domain apps include their own `urls.py` (client + admin).
"""

from django.urls import include, path

from users.urls import admin_urlpatterns as users_admin_urlpatterns, auth_urlpatterns

urlpatterns = [
    path("auth/", include(auth_urlpatterns)),
    path("", include(users_admin_urlpatterns)),
    path("", include("projects.urls")),
    path("", include("proposals.urls")),
    path("", include("experiments.urls")),
    path("", include("publications.urls")),
    path("", include("invitations.urls")),
    path("", include("facilities.urls")),
]
