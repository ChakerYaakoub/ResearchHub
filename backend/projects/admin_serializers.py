"""Admin-panel list/detail serializers (admin-ui Origin + platform ADMIN)."""

from rest_framework import serializers

from experiments.models import Experiment
from invitations.models import Invitation
from projects.models import ResearchProject
from proposals.models import Proposal
from publications.models import Publication
from users.models import GlobalRole, User


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "role",
            "is_active",
            "date_joined",
        )
        read_only_fields = ("id", "email", "username", "date_joined")


class AdminUserPatchSerializer(serializers.Serializer):
    """Activate/deactivate only — roles are set at create (admins) or register."""

    is_active = serializers.BooleanField(required=True)


class AdminCreateAdminSerializer(serializers.Serializer):
    """SUPER_ADMIN creates an ADMIN account (not promote researchers)."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    username = serializers.CharField(required=False, allow_blank=True, max_length=150)

    def validate_email(self, value: str) -> str:
        email = value.lower().strip()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_password(self, value: str) -> str:
        from django.contrib.auth.password_validation import validate_password

        validate_password(value)
        return value

    def create(self, validated_data: dict) -> User:
        email = validated_data["email"]
        username = validated_data.get("username") or email.split("@")[0]
        base = username
        suffix = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{suffix}"
            suffix += 1
        user = User(
            email=email,
            username=username,
            role=GlobalRole.ADMIN,
            is_staff=True,
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


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


class AdminProjectDetailSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    proposal_status = serializers.SerializerMethodField()
    experiment_count = serializers.IntegerField(read_only=True)
    publication_count = serializers.IntegerField(read_only=True)
    pending_invitation_count = serializers.IntegerField(read_only=True)

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
        )
        read_only_fields = fields

    def get_proposal_status(self, obj: ResearchProject) -> str | None:
        proposal = getattr(obj, "proposal", None)
        return proposal.status if proposal else None


class AdminProposalSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)

    class Meta:
        model = Proposal
        fields = (
            "id",
            "project",
            "project_title",
            "methodology",
            "expected_results",
            "submitted_at",
            "reviewed_at",
            "review_comment",
            "status",
        )
        read_only_fields = fields


class AdminExperimentSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)

    class Meta:
        model = Experiment
        fields = (
            "id",
            "project",
            "project_title",
            "kind",
            "instrument",
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
