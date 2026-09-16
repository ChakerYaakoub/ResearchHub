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
