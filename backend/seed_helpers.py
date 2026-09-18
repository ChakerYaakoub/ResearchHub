"""Idempotent demo/ORM builders for ``seed_demo`` (not a Django app).

Shared with ``test_helpers`` for consistent AuthZ-friendly object graphs.
Demo emails/password are for local seeding only — not used by the test suite.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from django.utils import timezone

from experiments.models import Experiment, ExperimentKind, ExperimentStatus
from facilities.models import (
    Installation,
    InstallationStatus,
    Instrument,
    InstrumentStatus,
)
from invitations.models import Invitation, InvitationRole, InvitationStatus
from projects.models import (
    MembershipRole,
    ProjectMembership,
    ProjectStatus,
    ResearchProject,
)
from proposals.models import Proposal, ProposalStatus
from publications.models import Publication, PublicationKind
from users.models import GlobalRole, User

DEMO_PASSWORD = "TestPass123!"

DEMO_SUPER_ADMIN_EMAIL = "admin@researchhub.local"
DEMO_ADMIN_EMAIL = "reviewer@researchhub.local"
DEMO_RESEARCHER_EMAIL = "researcher@researchhub.local"
DEMO_EDITOR_EMAIL = "editor@researchhub.local"
DEMO_VIEWER_EMAIL = "viewer@researchhub.local"
DEMO_COLLAB_EMAIL = "collaborator@researchhub.local"
DEMO_INVITEE_EMAIL = "invitee@researchhub.local"
DEMO_INVITEE2_EMAIL = "guest@example.com"

DEMO_USER_EMAILS = (
    DEMO_SUPER_ADMIN_EMAIL,
    DEMO_ADMIN_EMAIL,
    DEMO_RESEARCHER_EMAIL,
    DEMO_EDITOR_EMAIL,
    DEMO_VIEWER_EMAIL,
    DEMO_COLLAB_EMAIL,
    DEMO_INVITEE_EMAIL,
)

DEMO_INSTALLATION_NAMES = (
    "X-ray Facility",
    "Soft Matter Lab",
    "Cryo Lab",
)

# One project per ProjectStatus (+ proposals covering PENDING / APPROVED / REJECTED).
DEMO_PROJECT_DRAFT = "Demo · DRAFT beamline study"
DEMO_PROJECT_SUBMITTED = "Demo · SUBMITTED powder intent"
DEMO_PROJECT_UNDER_REVIEW = "Demo · UNDER_REVIEW SAXS proposal"
DEMO_PROJECT_APPROVED = "Demo · APPROVED cryo campaign"
DEMO_PROJECT_REJECTED = "Demo · REJECTED spectroscopy draft"
DEMO_PROJECT_RESUBMITTED = "Demo · RESUBMITTED oxide revisit"
DEMO_PROJECT_IN_PROGRESS = "Demo · IN_PROGRESS powder run"
DEMO_PROJECT_COMPLETED = "Demo · COMPLETED spectroscopy archive"
DEMO_PROJECT_SOFT_DELETED = "Demo · SOFT_DELETED retired draft"


@dataclass
class DemoUsers:
    super_admin: User
    platform_admin: User
    researcher: User
    editor: User
    viewer: User
    collaborator: User
    invitee: User


@dataclass
class DemoFacilities:
    installations: list[Installation]
    instruments: list[Instrument]


@dataclass
class DemoSeedResult:
    users: DemoUsers
    facilities: DemoFacilities
    projects: list[ResearchProject] = field(default_factory=list)
    invitations: list[Invitation] = field(default_factory=list)


def _ensure_user(
    email: str,
    *,
    username: str,
    role: str,
    password: str = DEMO_PASSWORD,
    is_staff: bool = False,
    is_superuser: bool = False,
) -> User:
    user, _ = User.objects.get_or_create(
        email=email,
        defaults={
            "username": username,
            "role": role,
            "is_staff": is_staff,
            "is_superuser": is_superuser,
        },
    )
    user.set_password(password)
    user.role = role
    user.is_staff = is_staff
    user.is_superuser = is_superuser
    user.save()
    return user


def ensure_demo_users(*, password: str = DEMO_PASSWORD) -> DemoUsers:
    """Create or refresh demo accounts (all share ``password``)."""
    return DemoUsers(
        super_admin=_ensure_user(
            DEMO_SUPER_ADMIN_EMAIL,
            username="admin",
            role=GlobalRole.SUPER_ADMIN,
            password=password,
            is_staff=True,
            is_superuser=True,
        ),
        platform_admin=_ensure_user(
            DEMO_ADMIN_EMAIL,
            username="reviewer",
            role=GlobalRole.ADMIN,
            password=password,
            is_staff=True,
        ),
        researcher=_ensure_user(
            DEMO_RESEARCHER_EMAIL,
            username="researcher",
            role=GlobalRole.RESEARCHER,
            password=password,
        ),
        editor=_ensure_user(
            DEMO_EDITOR_EMAIL,
            username="editor",
            role=GlobalRole.RESEARCHER,
            password=password,
        ),
        viewer=_ensure_user(
            DEMO_VIEWER_EMAIL,
            username="viewer",
            role=GlobalRole.RESEARCHER,
            password=password,
        ),
        collaborator=_ensure_user(
            DEMO_COLLAB_EMAIL,
            username="collaborator",
            role=GlobalRole.RESEARCHER,
            password=password,
        ),
        invitee=_ensure_user(
            DEMO_INVITEE_EMAIL,
            username="invitee",
            role=GlobalRole.RESEARCHER,
            password=password,
        ),
    )


def ensure_facilities() -> DemoFacilities:
    """Three ACTIVE installations and six AVAILABLE instruments."""
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
    cryo, _ = Installation.objects.get_or_create(
        name="Cryo Lab",
        defaults={
            "description": "Low-temperature sample prep.",
            "location": "Building C / Lab 2",
            "status": InstallationStatus.ACTIVE,
        },
    )

    specs = [
        (xray, "XRD-01", "Powder diffractometer", "XRD"),
        (xray, "XRD-02", "Single-crystal diffractometer", "XRD"),
        (xray, "SAXS-01", "Small-angle X-ray scattering", "SAXS"),
        (soft, "UV-01", "UV-Vis spectrometer", "Spectroscopy"),
        (soft, "FTIR-01", "FTIR spectrometer", "Spectroscopy"),
        (cryo, "CRYO-01", "Cryo sample stage", "Cryogenics"),
    ]
    instruments: list[Instrument] = []
    for installation, code, name, technique in specs:
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
        instruments.append(instr)

    return DemoFacilities(
        installations=[xray, soft, cryo],
        instruments=instruments,
    )


def _ensure_membership(
    project: ResearchProject, user: User, role: str
) -> ProjectMembership:
    membership, _ = ProjectMembership.objects.update_or_create(
        project=project,
        user=user,
        defaults={"role": role},
    )
    return membership


def _ensure_project(
    *,
    title: str,
    owner: User,
    description: str,
    scientific_objective: str,
    status: str,
) -> ResearchProject:
    project, _ = ResearchProject.objects.get_or_create(
        title=title,
        owner=owner,
        defaults={
            "description": description,
            "scientific_objective": scientific_objective,
            "status": status,
        },
    )
    if project.status != status:
        project.status = status
        project.save(update_fields=["status", "updated_at"])
    return project


def _ensure_proposal(
    project: ResearchProject,
    *,
    methodology: str,
    expected_results: str,
    status: str,
    review_comment: str = "",
) -> Proposal:
    proposal, created = Proposal.objects.get_or_create(
        project=project,
        defaults={
            "methodology": methodology,
            "expected_results": expected_results,
            "status": status,
            "review_comment": review_comment,
            "submitted_at": timezone.now() if status != ProposalStatus.PENDING else None,
            "reviewed_at": (
                timezone.now()
                if status in (ProposalStatus.APPROVED, ProposalStatus.REJECTED)
                else None
            ),
        },
    )
    if not created and proposal.status != status:
        proposal.status = status
        proposal.methodology = methodology
        proposal.expected_results = expected_results
        if review_comment:
            proposal.review_comment = review_comment
        proposal.save()
    return proposal


def _ensure_experiment(
    project: ResearchProject,
    instrument: Instrument,
    *,
    kind: str,
    status: str,
    notes: str,
    days_offset: int,
) -> Experiment:
    experiment, _ = Experiment.objects.get_or_create(
        project=project,
        instrument=instrument,
        kind=kind,
        defaults={
            "scheduled_date": timezone.now() + timezone.timedelta(days=days_offset),
            "status": status,
            "notes": notes,
        },
    )
    return experiment


def _ensure_publication(
    project: ResearchProject,
    *,
    title: str,
    authors: str,
    kind: str,
    journal: str = "",
) -> Publication:
    publication, _ = Publication.objects.get_or_create(
        project=project,
        title=title,
        defaults={
            "kind": kind,
            "authors": authors,
            "journal": journal,
        },
    )
    return publication


def ensure_demo_invitations(
    project: ResearchProject,
    invited_by: User,
    *,
    email: str,
    role: str = InvitationRole.EDITOR,
) -> Invitation:
    """PENDING invitation for ``email`` (membership only after accept)."""
    invitation, _ = Invitation.objects.get_or_create(
        project=project,
        email=email.lower().strip(),
        status=InvitationStatus.PENDING,
        defaults={
            "invited_by": invited_by,
            "role": role,
        },
    )
    return invitation


def ensure_demo_projects(
    users: DemoUsers,
    facilities: DemoFacilities,
) -> tuple[list[ResearchProject], list[Invitation]]:
    """One project per ProjectStatus; proposals cover PENDING / APPROVED / REJECTED."""
    instr = facilities.instruments
    xrd01, xrd02, saxs01, uv01, ftir01, cryo01 = instr
    projects: list[ResearchProject] = []

    # --- DRAFT + PENDING proposal ---
    draft = _ensure_project(
        title=DEMO_PROJECT_DRAFT,
        owner=users.researcher,
        description="Preparing draft — not submitted yet.",
        scientific_objective="Demonstrate planned experiments in DRAFT.",
        status=ProjectStatus.DRAFT,
    )
    _ensure_membership(draft, users.researcher, MembershipRole.OWNER)
    _ensure_membership(draft, users.editor, MembershipRole.EDITOR)
    _ensure_proposal(
        draft,
        methodology="XRD + SAXS on model samples.",
        expected_results="Diffraction patterns and size distributions.",
        status=ProposalStatus.PENDING,
    )
    _ensure_experiment(
        draft,
        xrd01,
        kind=ExperimentKind.PLANNED,
        status=ExperimentStatus.PLANNED,
        notes="Planned run on XRD-01",
        days_offset=30,
    )
    _ensure_publication(
        draft,
        title="Prior related work (demo)",
        authors="A. Researcher, B. Colleague",
        kind=PublicationKind.EXISTING,
        journal="Demo Journal",
    )
    inv_editor = ensure_demo_invitations(
        draft, users.researcher, email=DEMO_INVITEE_EMAIL, role=InvitationRole.EDITOR
    )
    inv_guest = ensure_demo_invitations(
        draft, users.researcher, email=DEMO_INVITEE2_EMAIL, role=InvitationRole.VIEWER
    )
    projects.append(draft)

    # --- SUBMITTED + PENDING proposal ---
    submitted = _ensure_project(
        title=DEMO_PROJECT_SUBMITTED,
        owner=users.editor,
        description="Just submitted; waiting to enter review.",
        scientific_objective="Submit powder diffraction intent.",
        status=ProjectStatus.SUBMITTED,
    )
    _ensure_membership(submitted, users.editor, MembershipRole.OWNER)
    _ensure_membership(submitted, users.researcher, MembershipRole.EDITOR)
    _ensure_proposal(
        submitted,
        methodology="Standard powder XRD intake.",
        expected_results="Phase ID checklist.",
        status=ProposalStatus.PENDING,
    )
    _ensure_experiment(
        submitted,
        xrd02,
        kind=ExperimentKind.PLANNED,
        status=ExperimentStatus.PLANNED,
        notes="Intent on XRD-02",
        days_offset=21,
    )
    projects.append(submitted)

    # --- UNDER_REVIEW + PENDING proposal ---
    under_review = _ensure_project(
        title=DEMO_PROJECT_UNDER_REVIEW,
        owner=users.collaborator,
        description="In scientific review on admin-ui.",
        scientific_objective="Map nanoparticle size distributions.",
        status=ProjectStatus.UNDER_REVIEW,
    )
    _ensure_membership(under_review, users.collaborator, MembershipRole.OWNER)
    _ensure_membership(under_review, users.researcher, MembershipRole.EDITOR)
    _ensure_membership(under_review, users.viewer, MembershipRole.VIEWER)
    _ensure_proposal(
        under_review,
        methodology="Temperature-dependent SAXS series.",
        expected_results="Rg vs T curves.",
        status=ProposalStatus.PENDING,
    )
    _ensure_experiment(
        under_review,
        saxs01,
        kind=ExperimentKind.PLANNED,
        status=ExperimentStatus.SCHEDULED,
        notes="Queued on SAXS-01",
        days_offset=14,
    )
    _ensure_publication(
        under_review,
        title="Related soft-matter survey",
        authors="C. Collaborator",
        kind=PublicationKind.EXISTING,
        journal="Soft Matter Letters",
    )
    projects.append(under_review)

    # --- APPROVED + APPROVED proposal (not started yet) ---
    approved = _ensure_project(
        title=DEMO_PROJECT_APPROVED,
        owner=users.researcher,
        description="Approved; ready to start (APPROVED → IN_PROGRESS).",
        scientific_objective="Cryo prep before beamtime.",
        status=ProjectStatus.APPROVED,
    )
    _ensure_membership(approved, users.researcher, MembershipRole.OWNER)
    _ensure_membership(approved, users.collaborator, MembershipRole.EDITOR)
    _ensure_proposal(
        approved,
        methodology="Cryo sample stage + XRD.",
        expected_results="Stable low-T mounts.",
        status=ProposalStatus.APPROVED,
        review_comment="Approved — schedule cryo prep.",
    )
    _ensure_experiment(
        approved,
        cryo01,
        kind=ExperimentKind.EXECUTED,
        status=ExperimentStatus.SCHEDULED,
        notes="Cryo stage booking",
        days_offset=5,
    )
    projects.append(approved)

    # --- REJECTED + REJECTED proposal ---
    rejected = _ensure_project(
        title=DEMO_PROJECT_REJECTED,
        owner=users.editor,
        description="Rejected after review — can revise / resubmit.",
        scientific_objective="Early UV-Vis survey (needs clearer methods).",
        status=ProjectStatus.REJECTED,
    )
    _ensure_membership(rejected, users.editor, MembershipRole.OWNER)
    _ensure_membership(rejected, users.viewer, MembershipRole.VIEWER)
    _ensure_proposal(
        rejected,
        methodology="Single-wavelength UV-Vis only.",
        expected_results="Absorbance peaks.",
        status=ProposalStatus.REJECTED,
        review_comment="Please add calibration standards and FTIR pairing.",
    )
    _ensure_experiment(
        rejected,
        uv01,
        kind=ExperimentKind.PLANNED,
        status=ExperimentStatus.PLANNED,
        notes="Held after reject",
        days_offset=45,
    )
    projects.append(rejected)

    # --- RESUBMITTED + PENDING proposal ---
    resubmitted = _ensure_project(
        title=DEMO_PROJECT_RESUBMITTED,
        owner=users.collaborator,
        description="Resubmitted after rejection; waiting for review again.",
        scientific_objective="Revised oxide powder methods.",
        status=ProjectStatus.RESUBMITTED,
    )
    _ensure_membership(resubmitted, users.collaborator, MembershipRole.OWNER)
    _ensure_membership(resubmitted, users.editor, MembershipRole.EDITOR)
    _ensure_proposal(
        resubmitted,
        methodology="Powder XRD + Rietveld with standards.",
        expected_results="Phase fractions with uncertainties.",
        status=ProposalStatus.PENDING,
    )
    _ensure_experiment(
        resubmitted,
        xrd01,
        kind=ExperimentKind.PLANNED,
        status=ExperimentStatus.PLANNED,
        notes="Revised plan on XRD-01",
        days_offset=18,
    )
    projects.append(resubmitted)

    # --- IN_PROGRESS + APPROVED proposal ---
    in_progress = _ensure_project(
        title=DEMO_PROJECT_IN_PROGRESS,
        owner=users.researcher,
        description="Approved campaign currently collecting data.",
        scientific_objective="Phase identification of oxide powders.",
        status=ProjectStatus.IN_PROGRESS,
    )
    _ensure_membership(in_progress, users.researcher, MembershipRole.OWNER)
    _ensure_membership(in_progress, users.editor, MembershipRole.EDITOR)
    _ensure_membership(in_progress, users.collaborator, MembershipRole.VIEWER)
    _ensure_proposal(
        in_progress,
        methodology="Powder XRD with Rietveld refinement.",
        expected_results="Phase fractions and lattice parameters.",
        status=ProposalStatus.APPROVED,
        review_comment="Looks solid — approved for beamtime.",
    )
    _ensure_experiment(
        in_progress,
        xrd02,
        kind=ExperimentKind.EXECUTED,
        status=ExperimentStatus.COMPLETED,
        notes="Completed run on XRD-02",
        days_offset=-7,
    )
    _ensure_experiment(
        in_progress,
        cryo01,
        kind=ExperimentKind.EXECUTED,
        status=ExperimentStatus.SCHEDULED,
        notes="Follow-up cryo prep",
        days_offset=10,
    )
    _ensure_publication(
        in_progress,
        title="Oxide powder methods note",
        authors="A. Researcher, E. Editor",
        kind=PublicationKind.EXISTING,
        journal="Powder Diffraction",
    )
    projects.append(in_progress)

    # --- COMPLETED + APPROVED proposal ---
    completed = _ensure_project(
        title=DEMO_PROJECT_COMPLETED,
        owner=users.editor,
        description="Finished spectroscopy study archived for demos.",
        scientific_objective="Benchmark UV-Vis / FTIR workflows.",
        status=ProjectStatus.COMPLETED,
    )
    _ensure_membership(completed, users.editor, MembershipRole.OWNER)
    _ensure_membership(completed, users.researcher, MembershipRole.VIEWER)
    _ensure_membership(completed, users.viewer, MembershipRole.VIEWER)
    _ensure_proposal(
        completed,
        methodology="Paired UV-Vis and FTIR on calibration standards.",
        expected_results="Reference spectra library.",
        status=ProposalStatus.APPROVED,
        review_comment="Approved; campaign completed.",
    )
    _ensure_experiment(
        completed,
        uv01,
        kind=ExperimentKind.EXECUTED,
        status=ExperimentStatus.COMPLETED,
        notes="UV-Vis archive run",
        days_offset=-60,
    )
    _ensure_experiment(
        completed,
        ftir01,
        kind=ExperimentKind.EXECUTED,
        status=ExperimentStatus.COMPLETED,
        notes="FTIR archive run",
        days_offset=-55,
    )
    _ensure_publication(
        completed,
        title="Spectroscopy workflow results (demo)",
        authors="E. Editor, A. Researcher, V. Viewer",
        kind=PublicationKind.RESULTING,
        journal="Demo Applied Spectroscopy",
    )
    projects.append(completed)

    # --- SOFT_DELETED + PENDING proposal ---
    soft_deleted = _ensure_project(
        title=DEMO_PROJECT_SOFT_DELETED,
        owner=users.researcher,
        description="Soft-deleted project (hidden from normal lists).",
        scientific_objective="Retired early draft for admin-panel demos.",
        status=ProjectStatus.SOFT_DELETED,
    )
    _ensure_membership(soft_deleted, users.researcher, MembershipRole.OWNER)
    _ensure_proposal(
        soft_deleted,
        methodology="Abandoned early notes.",
        expected_results="N/A",
        status=ProposalStatus.PENDING,
    )
    projects.append(soft_deleted)

    return projects, [inv_editor, inv_guest]


def seed_all(*, password: str = DEMO_PASSWORD) -> DemoSeedResult:
    """Full demo graph: users, facilities, multi-project relations, invitations."""
    users = ensure_demo_users(password=password)
    facilities = ensure_facilities()
    projects, invitations = ensure_demo_projects(users, facilities)
    return DemoSeedResult(
        users=users,
        facilities=facilities,
        projects=projects,
        invitations=invitations,
    )


def clear_demo() -> dict[str, int]:
    """Remove seeded demo users, their projects, and demo facilities.

    Order respects PROTECT FKs (invitations.invited_by, project.owner, instrument).
    Does not touch non-demo accounts or other installations.
    """
    from django.db.models import Q

    demo_users = User.objects.filter(email__in=DEMO_USER_EMAILS)
    demo_user_ids = list(demo_users.values_list("id", flat=True))

    invitations_deleted, _ = Invitation.objects.filter(
        Q(invited_by_id__in=demo_user_ids)
        | Q(email__in=[*DEMO_USER_EMAILS, DEMO_INVITEE2_EMAIL])
    ).delete()

    projects_qs = ResearchProject.objects.filter(owner_id__in=demo_user_ids)
    experiments_deleted, _ = Experiment.objects.filter(project__in=projects_qs).delete()
    projects_deleted, _ = projects_qs.delete()

    installations = Installation.objects.filter(name__in=DEMO_INSTALLATION_NAMES)
    # Any leftover experiments still pointing at demo instruments
    more_experiments, _ = Experiment.objects.filter(
        instrument__installation__in=installations
    ).delete()
    experiments_deleted += more_experiments

    instruments_deleted, _ = Instrument.objects.filter(
        installation__in=installations
    ).delete()
    installations_deleted, _ = installations.delete()

    users_deleted, _ = demo_users.delete()

    return {
        "invitations": invitations_deleted,
        "experiments": experiments_deleted,
        "projects": projects_deleted,
        "instruments": instruments_deleted,
        "installations": installations_deleted,
        "users": users_deleted,
    }
