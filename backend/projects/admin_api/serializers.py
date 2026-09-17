"""Admin-panel list/detail serializers (admin-ui Origin + platform ADMIN)."""

from rest_framework import serializers

from experiments.models import Experiment
from invitations.models import Invitation
from projects.models import ProjectMembership, ResearchProject
from proposals.admin_api.serializers import AdminProposalSerializer
from publications.models import Publication
class AdminProjectListSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = ResearchProject
        fields = (
            "id",
            "title",
            "status",
            "owner",
            "owner_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class AdminExperimentSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)
    instrument_code = serializers.CharField(source="instrument.code", read_only=True)
    instrument_name = serializers.CharField(source="instrument.name", read_only=True)
    installation_name = serializers.CharField(
        source="instrument.installation.name", read_only=True
    )

    class Meta:
        model = Experiment
        fields = (
            "id",
            "project",
            "project_title",
            "kind",
            "instrument",
            "instrument_code",
            "instrument_name",
            "installation_name",
            "scheduled_date",
            "status",
            "notes",
        )
        read_only_fields = fields


class AdminPublicationSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)

    class Meta:
        model = Publication
        fields = (
            "id",
            "project",
            "project_title",
            "kind",
            "title",
            "authors",
            "journal",
            "doi",
            "publication_date",
            "url",
        )
        read_only_fields = fields


class AdminInvitationSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)
    invited_by_email = serializers.EmailField(source="invited_by.email", read_only=True)

    class Meta:
        model = Invitation
        fields = (
            "id",
            "project",
            "project_title",
            "email",
            "invited_by",
            "invited_by_email",
            "role",
            "status",
            "expires_at",
            "created_at",
            "accepted_at",
        )
        read_only_fields = fields


class AdminProjectMemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = ProjectMembership
        fields = ("email", "role")
        read_only_fields = fields


class AdminProjectDetailSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    proposal_status = serializers.SerializerMethodField()
    experiment_count = serializers.IntegerField(read_only=True)
    publication_count = serializers.IntegerField(read_only=True)
    pending_invitation_count = serializers.IntegerField(read_only=True)
    proposal = AdminProposalSerializer(read_only=True, allow_null=True)
    members = AdminProjectMemberSerializer(
        source="memberships", many=True, read_only=True
    )
    experiments = AdminExperimentSerializer(many=True, read_only=True)
    publications = AdminPublicationSerializer(many=True, read_only=True)
    invitations = AdminInvitationSerializer(many=True, read_only=True)

    class Meta:
        model = ResearchProject
        fields = (
            "id",
            "title",
            "description",
            "scientific_objective",
            "status",
            "owner",
            "owner_email",
            "created_at",
            "updated_at",
            "member_count",
            "proposal_status",
            "experiment_count",
            "publication_count",
            "pending_invitation_count",
            "proposal",
            "members",
            "experiments",
            "publications",
            "invitations",
        )
        read_only_fields = fields

    def get_proposal_status(self, obj: ResearchProject) -> str | None:
        proposal = getattr(obj, "proposal", None)
        return proposal.status if proposal else None
