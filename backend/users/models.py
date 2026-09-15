"""Custom user: email login and global ADMIN/RESEARCHER role."""

from django.contrib.auth.models import AbstractUser
from django.db import models


class GlobalRole(models.TextChoices):
    """Platform role (separate from project OWNER/EDITOR/VIEWER)."""

    ADMIN = "ADMIN", "Admin"
    RESEARCHER = "RESEARCHER", "Researcher"


class User(AbstractUser):
    """AbstractUser + unique email as login id + global role."""

    email = models.EmailField("email address", unique=True)
    role = models.CharField(
        max_length=20,
        choices=GlobalRole.choices,
        default=GlobalRole.RESEARCHER,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        ordering = ["email"]

    def __str__(self) -> str:
        return self.email
