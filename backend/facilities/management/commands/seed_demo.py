"""Seed demo users, facilities, and a sample draft project (local testing)."""

from django.core.management.base import BaseCommand
from django.utils import timezone

from experiments.models import Experiment, ExperimentKind, ExperimentStatus
from facilities.models import (
    Installation,
    InstallationStatus,
    Instrument,
    InstrumentStatus,
)
from projects.models import MembershipRole, ProjectMembership, ResearchProject
from proposals.models import Proposal, ProposalStatus
from publications.models import Publication, PublicationKind
from users.models import GlobalRole, User

DEMO_PASSWORD = "TestPass123!"


class Command(BaseCommand):
    help = "Load demo users, installations, instruments, and a sample project."

    def handle(self, *args, **options):
        super_admin, _ = User.objects.get_or_create(
            email="admin@researchhub.local",
            defaults={
                "username": "admin",
                "role": GlobalRole.SUPER_ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        super_admin.set_password(DEMO_PASSWORD)
        super_admin.role = GlobalRole.SUPER_ADMIN
        super_admin.is_staff = True
        super_admin.is_superuser = True
        super_admin.save()

        platform_admin, _ = User.objects.get_or_create(
            email="reviewer@researchhub.local",
            defaults={
                "username": "reviewer",
                "role": GlobalRole.ADMIN,
                "is_staff": True,
            },
        )
        platform_admin.set_password(DEMO_PASSWORD)
        platform_admin.role = GlobalRole.ADMIN
        platform_admin.is_staff = True
        platform_admin.save()

        researcher, _ = User.objects.get_or_create(
            email="researcher@researchhub.local",
            defaults={"username": "researcher", "role": GlobalRole.RESEARCHER},
        )
        researcher.set_password(DEMO_PASSWORD)
        researcher.role = GlobalRole.RESEARCHER
        researcher.save()

        editor, _ = User.objects.get_or_create(
            email="editor@researchhub.local",
            defaults={"username": "editor", "role": GlobalRole.RESEARCHER},
        )
        editor.set_password(DEMO_PASSWORD)
        editor.save()

        xray, _ = Installation.objects.get_or_create(
            name="X-ray Facility",
            defaults={
                "description": "Hard X-ray experimental hall.",
                "location": "Building A / Hall 1",
                "status": InstallationStatus.ACTIVE,
            },
        )
        soft, _ = Installation.objects.get_or_create(
            name="Soft Matter Lab",
            defaults={
                "description": "SAXS and spectroscopy.",
                "location": "Building B / Lab 3",
                "status": InstallationStatus.ACTIVE,
            },
        )

        instruments = [
            (xray, "XRD-01", "Powder diffractometer", "XRD"),
            (xray, "XRD-02", "Single-crystal diffractometer", "XRD"),
            (xray, "SAXS-01", "Small-angle X-ray scattering", "SAXS"),
            (soft, "UV-01", "UV-Vis spectrometer", "Spectroscopy"),
        ]
        created_instruments = []
        for installation, code, name, technique in instruments:
            instr, _ = Instrument.objects.get_or_create(
                installation=installation,
                code=code,
                defaults={
                    "name": name,
                    "technique": technique,
                    "description": f"{name} at {installation.name}",
                    "status": InstrumentStatus.AVAILABLE,
                },
            )
            created_instruments.append(instr)

        project, created = ResearchProject.objects.get_or_create(
            title="Demo beamline study",
            owner=researcher,
            defaults={
                "description": "Sample project for local testing.",
                "scientific_objective": "Demonstrate planned vs executed experiments.",
            },
        )
        if created:
            ProjectMembership.objects.get_or_create(
                project=project,
                user=researcher,
                defaults={"role": MembershipRole.OWNER},
            )
            ProjectMembership.objects.get_or_create(
                project=project,
                user=editor,
                defaults={"role": MembershipRole.EDITOR},
            )
            Proposal.objects.get_or_create(
                project=project,
                defaults={
                    "methodology": "XRD + SAXS on model samples.",
                    "expected_results": "Diffraction patterns and size distributions.",
                    "status": ProposalStatus.PENDING,
                },
            )
            Experiment.objects.get_or_create(
                project=project,
                instrument=created_instruments[0],
                kind=ExperimentKind.PLANNED,
                defaults={
                    "scheduled_date": timezone.now() + timezone.timedelta(days=30),
                    "status": ExperimentStatus.PLANNED,
                    "notes": "Planned run on XRD-01",
                },
            )
            Publication.objects.get_or_create(
                project=project,
                title="Prior related work (demo)",
                defaults={
                    "kind": PublicationKind.EXISTING,
                    "authors": "A. Researcher, B. Colleague",
                    "journal": "Demo Journal",
                },
            )

        self.stdout.write(self.style.SUCCESS("Demo data ready."))
        self.stdout.write("")
        self.stdout.write("Accounts (password for all: TestPass123!)")
        self.stdout.write("  Super admin : admin@researchhub.local")
        self.stdout.write("  Admin       : reviewer@researchhub.local")
        self.stdout.write("  Researcher  : researcher@researchhub.local")
        self.stdout.write("  Editor      : editor@researchhub.local")
        self.stdout.write("")
        self.stdout.write(
            f"Installations: {Installation.objects.count()} | "
            f"Instruments: {Instrument.objects.count()} | "
            f"Project: {project.title}"
        )
