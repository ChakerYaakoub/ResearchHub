"""Admin-panel list/detail serializers (admin-ui Origin + platform ADMIN)."""

from rest_framework import serializers

from experiments.admin_api.serializers import AdminExperimentSerializer
from invitations.admin_api.serializers import AdminInvitationSerializer
from projects.models import ProjectMembership, ResearchProject
from proposals.admin_api.serializers import AdminProposalSerializer
from publications.admin_api.serializers import AdminPublicationSerializer


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
