"""Admin-panel user list/manage views (admin-ui Origin + platform ADMIN)."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.admin_filters import (
    apply_is_active,
    apply_user_search,
    query_bool,
    query_search,
)
from core.api import ADMIN_PERMS, SUPER_ADMIN_PERMS
from projects.selectors import is_super_admin
from users.models import GlobalRole, User

from .serializers import (
    AdminCreateAdminSerializer,
    AdminUserPatchSerializer,
    AdminUserSerializer,
)


class AdminUserListView(APIView):
    """GET researchers (default); POST create ADMIN (super admin only)."""

    def get_permissions(self):
        if self.request.method == "POST":
            return [perm() for perm in SUPER_ADMIN_PERMS]
        return [perm() for perm in ADMIN_PERMS]

    def get(self, request):
        # Default / ?role=RESEARCHER → researchers only (Users page).
        role = (request.query_params.get("role") or GlobalRole.RESEARCHER).strip().upper()
        if role != GlobalRole.RESEARCHER:
            return Response(
                {"detail": "Use GET /api/admin/admins/ for admin accounts."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        is_active = query_bool(request, "is_active")
        if is_active == "invalid":
            return Response(
                {"detail": "Invalid is_active. Use true or false."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        qs = User.objects.filter(role=GlobalRole.RESEARCHER).order_by("email")
        qs = apply_user_search(qs, query_search(request))
        qs = apply_is_active(qs, is_active)
        return Response(AdminUserSerializer(qs, many=True).data)

    def post(self, request):
        ser = AdminCreateAdminSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        return Response(
            AdminUserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class AdminAdminListView(APIView):
    """GET `/api/admin/admins/` — SUPER_ADMIN only; ADMIN + SUPER_ADMIN accounts."""

    permission_classes = SUPER_ADMIN_PERMS

    def get(self, request):
        is_active = query_bool(request, "is_active")
        if is_active == "invalid":
            return Response(
                {"detail": "Invalid is_active. Use true or false."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        qs = User.objects.filter(
            role__in=(GlobalRole.ADMIN, GlobalRole.SUPER_ADMIN)
        ).order_by("email")
        qs = apply_user_search(qs, query_search(request))
        qs = apply_is_active(qs, is_active)
        return Response(AdminUserSerializer(qs, many=True).data)


class AdminUserDetailView(APIView):
    """PATCH `/api/admin/users/{id}/` — is_active only (not self)."""

    permission_classes = ADMIN_PERMS

    def patch(self, request, user_id: int):
        target = get_object_or_404(User, pk=user_id)
        if target.pk == request.user.pk:
            return Response(
                {"detail": "You cannot change your own active status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # SUPER_ADMIN accounts are never deactivated via the admin API.
        if target.role == GlobalRole.SUPER_ADMIN:
            return Response(
                {"detail": "Super admin accounts cannot be deactivated."},
                status=status.HTTP_403_FORBIDDEN,
            )
        # Only SUPER_ADMIN may activate/deactivate ADMIN accounts.
        if target.role == GlobalRole.ADMIN:
            if not is_super_admin(request.user):
                return Response(
                    {"detail": "Only a super admin can change admin accounts."},
                    status=status.HTTP_403_FORBIDDEN,
                )
        ser = AdminUserPatchSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        target.is_active = ser.validated_data["is_active"]
        target.save(update_fields=["is_active"])
        return Response(AdminUserSerializer(target).data)
