"""Seed demo users, facilities, project graph, and sample invitations."""

from django.core.management.base import BaseCommand

from experiments.models import Experiment
from facilities.models import Installation, Instrument
from invitations.models import Invitation
from projects.models import ResearchProject
from proposals.models import Proposal
from publications.models import Publication
from seed_helpers import (
    DEMO_ADMIN_EMAIL,
    DEMO_COLLAB_EMAIL,
    DEMO_EDITOR_EMAIL,
    DEMO_INVITEE_EMAIL,
    DEMO_PASSWORD,
    DEMO_RESEARCHER_EMAIL,
    DEMO_SUPER_ADMIN_EMAIL,
    DEMO_VIEWER_EMAIL,
    seed_all,
)


class Command(BaseCommand):
    help = (
        "Load demo users, installations, instruments, one project per status "
        "(all proposal statuses), and pending invitations."
    )

    def handle(self, *args, **options):
        graph = seed_all(password=DEMO_PASSWORD)

        self.stdout.write(self.style.SUCCESS("Demo data ready."))
        self.stdout.write("")
        self.stdout.write(f"Accounts (password for all: {DEMO_PASSWORD})")
        self.stdout.write(f"  Super admin  : {DEMO_SUPER_ADMIN_EMAIL}")
        self.stdout.write(f"  Admin        : {DEMO_ADMIN_EMAIL}")
        self.stdout.write(f"  Researcher   : {DEMO_RESEARCHER_EMAIL}")
        self.stdout.write(f"  Editor       : {DEMO_EDITOR_EMAIL}")
        self.stdout.write(f"  Viewer       : {DEMO_VIEWER_EMAIL}")
        self.stdout.write(f"  Collaborator : {DEMO_COLLAB_EMAIL}")
        self.stdout.write(f"  Invitee      : {DEMO_INVITEE_EMAIL}")
        self.stdout.write("")
        self.stdout.write(
            f"Installations: {Installation.objects.count()} | "
            f"Instruments: {Instrument.objects.count()} | "
            f"Projects: {ResearchProject.objects.count()} | "
            f"Proposals: {Proposal.objects.count()} | "
            f"Experiments: {Experiment.objects.count()} | "
            f"Publications: {Publication.objects.count()} | "
            f"Invitations: {Invitation.objects.count()}"
        )
        self.stdout.write("Projects:")
        for project in graph.projects:
            self.stdout.write(f"  - {project.title} [{project.status}]")
        self.stdout.write("Pending invitations:")
        for invitation in graph.invitations:
            self.stdout.write(
                f"  - {invitation.email} → {invitation.project.title} "
                f"({invitation.role})"
            )
