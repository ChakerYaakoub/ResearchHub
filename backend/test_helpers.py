"""Shared helpers for Django/DRF API tests (not a Django app)."""

from django.conf import settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from projects.models import MembershipRole, ProjectMembership, ResearchProject
from users.models import GlobalRole, User

DEFAULT_PASSWORD = "TestPass123!"


def make_user(
    email: str,
    *,
    password: str = DEFAULT_PASSWORD,
    global_role: str = GlobalRole.RESEARCHER,
    **extra,
) -> User:
    """Create a user with email login; username derived from email local-part."""
    email = email.lower().strip()
    username = extra.pop("username", None) or email.split("@")[0]
    base = username
    suffix = 1
    while User.objects.filter(username=username).exists():
        username = f"{base}{suffix}"
        suffix += 1
    user = User(email=email, username=username, role=global_role, **extra)
    user.set_password(password)
    user.save()
    return user


def make_admin(
    email: str = "admin@example.com",
    *,
    password: str = DEFAULT_PASSWORD,
    **extra,
) -> User:
    return make_user(email, password=password, global_role=GlobalRole.ADMIN, **extra)


def make_super_admin(
    email: str = "super@example.com",
    *,
    password: str = DEFAULT_PASSWORD,
    **extra,
) -> User:
    return make_user(
        email, password=password, global_role=GlobalRole.SUPER_ADMIN, **extra
    )


def auth_client(user: User) -> APIClient:
    """APIClient with Bearer access JWT for ``user``."""
    client = APIClient()
    access = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    return client


def admin_client(user: User) -> APIClient:
    """Authenticated client plus admin-ui Origin header."""
    client = auth_client(user)
    origins = getattr(settings, "ADMIN_UI_ORIGINS", []) or ["http://localhost:5175"]
    client.defaults["HTTP_ORIGIN"] = origins[0].rstrip("/")
    return client


def make_project(owner: User, *, title: str = "Test project", **kwargs) -> ResearchProject:
    """Create a project with OWNER membership (mirrors API create)."""
    project = ResearchProject.objects.create(owner=owner, title=title, **kwargs)
    ProjectMembership.objects.get_or_create(
        project=project,
        user=owner,
        defaults={"role": MembershipRole.OWNER},
    )
    return project


def make_instrument(
    *,
    code: str = "XRD-01",
    name: str = "Diffractometer",
    installation_name: str = "X-ray Facility",
    technique: str = "XRD",
):
    """Create an ACTIVE installation + AVAILABLE instrument for experiment tests."""
    from facilities.models import Installation, Instrument

    installation, _ = Installation.objects.get_or_create(
        name=installation_name,
        defaults={"status": "ACTIVE"},
    )
    instrument, _ = Instrument.objects.get_or_create(
        installation=installation,
        code=code,
        defaults={
            "name": name,
            "technique": technique,
            "status": "AVAILABLE",
        },
    )
    return instrument


def add_member(
    project: ResearchProject,
    user: User,
    role: str = MembershipRole.EDITOR,
) -> ProjectMembership:
    membership, _ = ProjectMembership.objects.update_or_create(
        project=project,
        user=user,
        defaults={"role": role},
    )
    return membership
