"""Remove seeded demo users, projects, and facilities."""

from django.core.management.base import BaseCommand

from seed_helpers import clear_demo


class Command(BaseCommand):
    help = (
        "Delete demo seed data (demo users, their projects/proposals/experiments, "
        "demo installations). Non-demo accounts are left alone."
    )

    def handle(self, *args, **options):
        counts = clear_demo()
        self.stdout.write(self.style.SUCCESS("Demo data cleared."))
        self.stdout.write(
            "  users={users} projects={projects} experiments={experiments} "
            "invitations={invitations} instruments={instruments} "
            "installations={installations}".format(**counts)
        )
        self.stdout.write("Re-seed with: make seed-demo  (or make k8s-seed-demo)")
