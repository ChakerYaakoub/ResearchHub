/** Shared API types for researcher dashboard. */

export type ProjectStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'

export type Project = {
  id: number
  title: string
  description: string
  scientific_objective: string
  status: ProjectStatus
  owner: number
  owner_email: string
  created_at: string
  updated_at: string
}

export type ProjectCreateInput = {
  title: string
  description?: string
  scientific_objective?: string
}

export type MembershipRole = 'OWNER' | 'EDITOR' | 'VIEWER'

export type ProjectMembership = {
  id: number
  project: number
  user: number
  user_email: string
  role: MembershipRole
  created_at: string
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'

export type InvitationRole = 'EDITOR' | 'VIEWER'

export type Invitation = {
  id: number
  project: number
  project_title: string
  email: string
  invited_by: number
  invited_by_email: string
  role: InvitationRole
  status: InvitationStatus
  expires_at: string
  created_at: string
  accepted_at: string | null
  /** Present on my-invitations and create responses for accept/decline. */
  token?: string
}

export type InvitationCreateInput = {
  email: string
  role: InvitationRole
}

export type ProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type Proposal = {
  id: number
  project: number
  methodology: string
  expected_results: string
  submitted_at: string | null
  reviewed_at: string | null
  review_comment: string
  status: ProposalStatus
}

export type ProposalInput = {
  methodology?: string
  expected_results?: string
}

export type ExperimentKind = 'PLANNED' | 'EXECUTED'

export type ExperimentStatus =
  | 'PLANNED'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'

export type Experiment = {
  id: number
  project: number
  kind: ExperimentKind
  instrument: number
  instrument_code: string
  instrument_name: string
  installation_id: number
  installation_name: string
  scheduled_date: string
  status: ExperimentStatus
  notes: string
}

export type ExperimentInput = {
  kind?: ExperimentKind
  instrument: number
  scheduled_date: string
  status?: ExperimentStatus
  notes?: string
}

export type Installation = {
  id: number
  name: string
  description: string
  location: string
  status: 'ACTIVE' | 'INACTIVE'
}

export type Instrument = {
  id: number
  installation: number
  installation_name: string
  code: string
  name: string
  technique: string
  description: string
  status: 'AVAILABLE' | 'UNAVAILABLE'
}

export type PublicationKind = 'EXISTING' | 'RESULTING'

export type Publication = {
  id: number
  project: number
  kind: PublicationKind
  title: string
  authors: string
  journal: string
  doi: string
  publication_date: string | null
  url: string
}

export type PublicationInput = {
  kind?: PublicationKind
  title: string
  authors: string
  journal?: string
  doi?: string
  publication_date?: string | null
  url?: string
}
