"""Model constraint tests."""

from django.db import IntegrityError, transaction
from django.test import TestCase

from invitations.models import Invitation, InvitationRole
from projects.models import MembershipRole, ProjectMembership
from proposals.models import Proposal
from test_helpers import make_project, make_user


class ModelConstraintTests(TestCase):
    """DB uniqueness: membership, one proposal per project, invitation token."""
    def test_unique_project_membership(self):
        owner = make_user("owner@example.com")
        other = make_user("other@example.com")
        project = make_project(owner)
        ProjectMembership.objects.create(
            project=project, user=other, role=MembershipRole.EDITOR
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                ProjectMembership.objects.create(
                    project=project, user=other, role=MembershipRole.VIEWER
                )

    def test_one_proposal_per_project(self):
        owner = make_user("owner@example.com")
        project = make_project(owner)
        Proposal.objects.create(
            project=project, methodology="m", expected_results="r"
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Proposal.objects.create(
                    project=project, methodology="m2", expected_results="r2"
                )

    def test_unique_invitation_token(self):
        owner = make_user("owner@example.com")
        project = make_project(owner)
        first = Invitation.objects.create(
            project=project,
            invited_by=owner,
            email="a@example.com",
            role=InvitationRole.VIEWER,
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Invitation.objects.create(
                    project=project,
                    invited_by=owner,
                    email="b@example.com",
                    role=InvitationRole.EDITOR,
                    token=first.token,
                )
