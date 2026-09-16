"""Custom user: email login and global ADMIN/RESEARCHER role."""

from django.contrib.auth.models import AbstractUser, UserManager as DjangoUserManager
from django.db import models


class GlobalRole(models.TextChoices):
    """Platform role (separate from project OWNER/EDITOR/VIEWER)."""

    ADMIN = "ADMIN", "Admin"
    RESEARCHER = "RESEARCHER", "Researcher"


class UserManager(DjangoUserManager):
    """Ensure createsuperuser gets platform ADMIN role for admin-ui."""

    def create_superuser(self, username=None, email=None, password=None, **extra_fields):
        extra_fields.setdefault("role", GlobalRole.ADMIN)
        return super().create_superuser(
            username=username,
            email=email,
            password=password,
            **extra_fields,
        )


class User(AbstractUser):
    """AbstractUser + unique email as login id + global role."""

    email = models.EmailField("email address", unique=True)
    role = models.CharField(
        max_length=20,
        choices=GlobalRole.choices,
        default=GlobalRole.RESEARCHER,
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        ordering = ["email"]

    def __str__(self) -> str:
        return self.email
