import { apiFetch } from './client'

export type AdminStats = {
  total_projects: number
  pending_proposals: number
  scheduled_experiments: number
  completed_projects: number
  researchers: number
  pending_invitations: number
  publications: number
}

export type AdminUser = {
  id: number
  email: string
  username: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'RESEARCHER'
  is_active: boolean
  date_joined: string
}

export type AdminProject = {
  id: number
  title: string
  status: string
  owner: number
  owner_email: string
  created_at: string
  updated_at: string
}

export type AdminProjectDetail = AdminProject & {
  description: string
  scientific_objective: string
  member_count: number
  proposal_status: string | null
  experiment_count: number
  publication_count: number
  pending_invitation_count: number
}

export type AdminProposal = {
  id: number
  project: number
  project_title: string
  project_status?: string
  methodology: string
  expected_results: string
  submitted_at: string | null
  reviewed_at?: string | null
  review_comment?: string
  status: string
}

export type AdminExperiment = {
  id: number
  project: number
  project_title: string
  kind?: string
  instrument: number
  instrument_code?: string
  instrument_name?: string
  installation_name?: string
  scheduled_date: string
  status: string
  notes: string
}

export type AdminInstallation = {
  id: number
  name: string
  description: string
  location: string
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
  updated_at: string
}

export type AdminInstrument = {
  id: number
  installation: number
  installation_name: string
  code: string
  name: string
  technique: string
  description: string
  status: 'AVAILABLE' | 'UNAVAILABLE'
  created_at: string
  updated_at: string
}

export type AdminPublication = {
  id: number
  project: number
  project_title: string
  title: string
  authors: string
  journal: string
  doi: string
  publication_date: string | null
  url: string
}

export type AdminInvitation = {
  id: number
  project: number
  project_title: string
  email: string
  invited_by: number
  invited_by_email: string
  role: string
  status: string
  expires_at: string
  created_at: string
  accepted_at: string | null
}

export function getAdminStats(token: string) {
  return apiFetch<AdminStats>('/admin/stats/', { token })
}

export function listUsers(token: string) {
  return listResearchers(token)
}

export function listResearchers(token: string) {
  return apiFetch<AdminUser[]>('/admin/users/?role=RESEARCHER', { token })
}

export function listAdmins(token: string) {
  return apiFetch<AdminUser[]>('/admin/admins/', { token })
}

export function createAdmin(
  token: string,
  body: { email: string; password: string; username?: string },
) {
  return apiFetch<AdminUser>('/admin/users/', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export function patchUser(
  token: string,
  id: number,
  body: { is_active: boolean },
) {
  return apiFetch<AdminUser>(`/admin/users/${id}/`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  })
}

export function listProjects(token: string) {
  return apiFetch<AdminProject[]>('/admin/projects/', { token })
}

export function getProject(token: string, id: number) {
  return apiFetch<AdminProjectDetail>(`/admin/projects/${id}/`, { token })
}

export function deleteProject(token: string, id: number) {
  return apiFetch<void>(`/projects/${id}/`, {
    method: 'DELETE',
    token,
  })
}

export function listProposals(token: string, status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiFetch<AdminProposal[]>(`/admin/proposals/${q}`, { token })
}

export function listPendingProposals(token: string) {
  return apiFetch<AdminProposal[]>('/admin/proposals/?queue=review', { token })
}

export function approveProposal(
  token: string,
  id: number,
  review_comment = '',
) {
  return apiFetch<AdminProposal>(`/proposals/${id}/approve/`, {
    method: 'POST',
    token,
    body: JSON.stringify({ review_comment }),
  })
}

export function rejectProposal(
  token: string,
  id: number,
  review_comment = '',
) {
  return apiFetch<AdminProposal>(`/proposals/${id}/reject/`, {
    method: 'POST',
    token,
    body: JSON.stringify({ review_comment }),
  })
}

export function listExperiments(token: string) {
  return apiFetch<AdminExperiment[]>('/admin/experiments/', { token })
}

export function listInstallations(token: string) {
  return apiFetch<AdminInstallation[]>('/admin/installations/', { token })
}

export function createInstallation(
  token: string,
  body: Partial<AdminInstallation>,
) {
  return apiFetch<AdminInstallation>('/admin/installations/', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export function patchInstallation(
  token: string,
  id: number,
  body: Partial<AdminInstallation>,
) {
  return apiFetch<AdminInstallation>(`/admin/installations/${id}/`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  })
}

export function deleteInstallation(token: string, id: number) {
  return apiFetch<void>(`/admin/installations/${id}/`, {
    method: 'DELETE',
    token,
  })
}

export function listAdminInstruments(token: string, installationId?: number) {
  const q =
    installationId != null ? `?installation=${installationId}` : ''
  return apiFetch<AdminInstrument[]>(`/admin/instruments/${q}`, { token })
}

export function createInstrument(
  token: string,
  body: {
    installation: number
    code: string
    name: string
    technique?: string
    description?: string
    status?: string
  },
) {
  return apiFetch<AdminInstrument>('/admin/instruments/', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export function patchInstrument(
  token: string,
  id: number,
  body: Partial<{
    installation: number
    code: string
    name: string
    technique: string
    description: string
    status: string
  }>,
) {
  return apiFetch<AdminInstrument>(`/admin/instruments/${id}/`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  })
}

export function deleteInstrument(token: string, id: number) {
  return apiFetch<void>(`/admin/instruments/${id}/`, {
    method: 'DELETE',
    token,
  })
}

export function listPublications(token: string) {
  return apiFetch<AdminPublication[]>('/admin/publications/', { token })
}

export function listInvitations(token: string) {
  return apiFetch<AdminInvitation[]>('/admin/invitations/', { token })
}

export function cancelInvitation(token: string, id: number) {
  return apiFetch<void>(`/admin/invitations/${id}/`, {
    method: 'DELETE',
    token,
  })
}
