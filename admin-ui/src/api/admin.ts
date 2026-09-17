import { apiFetch } from './client'
import {
  adminQuery,
  type InstallationListParams,
  type InstrumentListParams,
  type InvitationListParams,
  type ProjectListParams,
  type ProposalListParams,
  type PublicationListParams,
  type UserListParams,
} from './adminQuery'

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
  kind?: string
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

export function listUsers(token: string, params?: UserListParams) {
  return listResearchers(token, params)
}

export function listResearchers(token: string, params?: UserListParams) {
  const q = adminQuery({
    role: 'RESEARCHER',
    search: params?.search,
    is_active:
      params?.is_active === '' || params?.is_active === undefined
        ? undefined
        : params.is_active,
  })
  return apiFetch<AdminUser[]>(`/admin/users/${q}`, { token })
}

export function listAdmins(token: string, params?: UserListParams) {
  const q = adminQuery({
    search: params?.search,
    is_active:
      params?.is_active === '' || params?.is_active === undefined
        ? undefined
        : params.is_active,
  })
  return apiFetch<AdminUser[]>(`/admin/admins/${q}`, { token })
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

export function listProjects(token: string, params?: ProjectListParams) {
  const q = adminQuery({ status: params?.status, search: params?.search })
  return apiFetch<AdminProject[]>(`/admin/projects/${q}`, { token })
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

export function listProposals(
  token: string,
  params?: ProposalListParams | string,
) {
  const normalized =
    typeof params === 'string' ? { status: params || undefined } : (params ?? {})
  const q = adminQuery({
    status: normalized.status,
    search: normalized.search,
  })
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

export function listInstallations(
  token: string,
  params?: InstallationListParams,
) {
  const q = adminQuery({ status: params?.status, search: params?.search })
  return apiFetch<AdminInstallation[]>(`/admin/installations/${q}`, { token })
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

export function listAdminInstruments(
  token: string,
  params?: InstrumentListParams | number,
) {
  const normalized =
    typeof params === 'number' ? { installation: params } : (params ?? {})
  const q = adminQuery({
    installation: normalized.installation,
    status: normalized.status,
    search: normalized.search,
  })
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

export function listPublications(token: string, params?: PublicationListParams) {
  const q = adminQuery({ search: params?.search, kind: params?.kind })
  return apiFetch<AdminPublication[]>(`/admin/publications/${q}`, { token })
}

export function listInvitations(token: string, params?: InvitationListParams) {
  const q = adminQuery({
    status: params?.status,
    search: params?.search,
    project: params?.project,
  })
  return apiFetch<AdminInvitation[]>(`/admin/invitations/${q}`, { token })
}

export function cancelInvitation(token: string, id: number) {
  return apiFetch<void>(`/admin/invitations/${id}/`, {
    method: 'DELETE',
    token,
  })
}
