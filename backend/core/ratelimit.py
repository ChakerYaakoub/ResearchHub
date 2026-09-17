"""DRF-friendly helpers for django-ratelimit (JSON 429 instead of Django 403)."""

from django_ratelimit.exceptions import Ratelimited
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class RatelimitedAPIView(APIView):
    """APIView that returns HTTP 429 when django-ratelimit blocks the request."""

    def handle_exception(self, exc):
        if isinstance(exc, Ratelimited):
            return Response(
                {"detail": "Too many requests. Please try again later."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        return super().handle_exception(exc)
