"""Proposal / project workflow API tests."""

from django.test import TestCase, override_settings
from rest_framework import status

from projects.models import ProjectStatus
from projects.services import WorkflowError, transition_project
from proposals.models import ProposalStatus
from test_helpers import (
    admin_client,
    auth_client,
    make_admin,
    make_instrument,
    make_project,
    make_user,
)


@override_settings(ADMIN_UI_ORIGINS=["http://localhost:5175"])
class WorkflowApiTests(TestCase):
    """Submit/approve/reject/resubmit, complete, and experiment kind gates across lifecycle."""

    def setUp(self):
        self.owner = make_user("owner@example.com")
        self.admin = make_admin()
        self.project = make_project(self.owner)
        self.owner_client = auth_client(self.owner)
        self.admin_api = admin_client(self.admin)

    def _create_proposal(self):
        """Create draft proposal text for the owner project (helper for submit tests)."""
        response = self.owner_client.post(
            f"/api/projects/{self.project.id}/proposal/",
            {"methodology": "XAS", "expected_results": "spectra"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response.data

    def test_submit_advances_to_under_review(self):
        proposal = self._create_proposal()
        response = self.owner_client.post(
            f"/api/projects/{self.project.id}/proposal/submit/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], ProposalStatus.PENDING)
        self.assertIsNotNone(response.data["submitted_at"])
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.UNDER_REVIEW)

    def test_submit_without_proposal_rejected(self):
        response = self.owner_client.post(
            f"/api/projects/{self.project.id}/proposal/submit/"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_approve_and_reject_require_admin_origin(self):
        self._create_proposal()
        self.owner_client.post(f"/api/projects/{self.project.id}/proposal/submit/")
        self.project.refresh_from_db()
        proposal_id = self.project.proposal.id

        no_origin = auth_client(self.admin)
        denied = no_origin.post(f"/api/proposals/{proposal_id}/approve/", {}, format="json")
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

        approved = self.admin_api.post(
            f"/api/proposals/{proposal_id}/approve/",
            {"review_comment": "ok"},
            format="json",
        )
        self.assertEqual(approved.status_code, status.HTTP_200_OK)
        self.assertEqual(approved.data["status"], ProposalStatus.APPROVED)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.APPROVED)

    def test_reject_sets_rejected(self):
        self._create_proposal()
        self.owner_client.post(f"/api/projects/{self.project.id}/proposal/submit/")
        proposal_id = self.project.proposal.id
        rejected = self.admin_api.post(
            f"/api/proposals/{proposal_id}/reject/",
            {"review_comment": "no"},
            format="json",
        )
        self.assertEqual(rejected.status_code, status.HTTP_200_OK)
        self.assertEqual(rejected.data["status"], ProposalStatus.REJECTED)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.REJECTED)

    def test_first_experiment_starts_project_then_complete(self):
        self._create_proposal()
        self.owner_client.post(f"/api/projects/{self.project.id}/proposal/submit/")
        self.admin_api.post(
            f"/api/proposals/{self.project.proposal.id}/approve/",
            {},
            format="json",
        )
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.APPROVED)

        instrument = make_instrument(code="beamline-1", name="Beamline 1")
        exp = self.owner_client.post(
            f"/api/projects/{self.project.id}/experiments/",
            {
                "kind": "EXECUTED",
                "instrument": instrument.id,
                "scheduled_date": "2030-01-15T10:00:00Z",
                "notes": "run",
            },
            format="json",
        )
        self.assertEqual(exp.status_code, status.HTTP_201_CREATED)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.IN_PROGRESS)

        done = self.owner_client.post(f"/api/projects/{self.project.id}/complete/")
        self.assertEqual(done.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.COMPLETED)

    def test_complete_from_draft_rejected(self):
        response = self.owner_client.post(f"/api/projects/{self.project.id}/complete/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_illegal_transition_raises(self):
        with self.assertRaises(WorkflowError):
            transition_project(self.project, ProjectStatus.COMPLETED)

    def test_second_proposal_create_rejected(self):
        self._create_proposal()
        again = self.owner_client.post(
            f"/api/projects/{self.project.id}/proposal/",
            {"methodology": "again", "expected_results": "x"},
            format="json",
        )
        self.assertEqual(again.status_code, status.HTTP_400_BAD_REQUEST)

    def test_approve_twice_rejected(self):
        self._create_proposal()
        self.owner_client.post(f"/api/projects/{self.project.id}/proposal/submit/")
        pid = self.project.proposal.id
        self.admin_api.post(f"/api/proposals/{pid}/approve/", {}, format="json")
        again = self.admin_api.post(f"/api/proposals/{pid}/approve/", {}, format="json")
        self.assertEqual(again.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reject_then_revise_and_resubmit(self):
        self._create_proposal()
        self.owner_client.post(f"/api/projects/{self.project.id}/proposal/submit/")
        proposal_id = self.project.proposal.id
        rejected = self.admin_api.post(
            f"/api/proposals/{proposal_id}/reject/",
            {"review_comment": "needs more detail"},
            format="json",
        )
        self.assertEqual(rejected.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.REJECTED)

        edited = self.owner_client.put(
            f"/api/projects/{self.project.id}/proposal/",
            {"methodology": "Revised XAS", "expected_results": "better spectra"},
            format="json",
        )
        self.assertEqual(edited.status_code, status.HTTP_200_OK)
        self.assertEqual(edited.data["methodology"], "Revised XAS")
        self.assertEqual(edited.data["review_comment"], "needs more detail")

        instrument = make_instrument(code="beamline-r", name="Resubmit Beamline")
        planned = self.owner_client.post(
            f"/api/projects/{self.project.id}/experiments/",
            {
                "kind": "PLANNED",
                "instrument": instrument.id,
                "scheduled_date": "2030-02-01T10:00:00Z",
                "notes": "plan after reject",
            },
            format="json",
        )
        self.assertEqual(planned.status_code, status.HTTP_201_CREATED)

        resubmit = self.owner_client.post(
            f"/api/projects/{self.project.id}/proposal/submit/"
        )
        self.assertEqual(resubmit.status_code, status.HTTP_200_OK)
        self.assertEqual(resubmit.data["status"], ProposalStatus.PENDING)
        self.assertEqual(resubmit.data["review_comment"], "needs more detail")
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.UNDER_REVIEW)

        approved = self.admin_api.post(
            f"/api/proposals/{proposal_id}/approve/",
            {"review_comment": "ok now"},
            format="json",
        )
        self.assertEqual(approved.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.APPROVED)

    def test_planned_experiment_blocked_while_under_review(self):
        self._create_proposal()
        self.owner_client.post(f"/api/projects/{self.project.id}/proposal/submit/")
        self.project.refresh_from_db()
        self.assertEqual(self.project.status, ProjectStatus.UNDER_REVIEW)
        instrument = make_instrument(code="beamline-u", name="Under Review Line")
        blocked = self.owner_client.post(
            f"/api/projects/{self.project.id}/experiments/",
            {
                "kind": "PLANNED",
                "instrument": instrument.id,
                "scheduled_date": "2030-03-01T10:00:00Z",
            },
            format="json",
        )
        self.assertEqual(blocked.status_code, status.HTTP_400_BAD_REQUEST)
