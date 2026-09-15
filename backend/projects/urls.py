"""Project API routes."""

from rest_framework.routers import DefaultRouter

from .views import ResearchProjectViewSet

router = DefaultRouter()
router.register("projects", ResearchProjectViewSet, basename="project")

urlpatterns = router.urls
