import { apiFetch } from './client'
import type {
  Invitation,
  InvitationCreateInput,
} from '../types/api'

/** Paths are relative to VITE_API_BASE_URL (already ends with /api). */

export function listMyInvitations(token: string) {
  return apiFetch<Invitation[]>('/invitations/', { token })
}

export function listProjectInvitations(
  token: string,
  projectId: string,
) {
  return apiFetch<Invitation[]>(`/projects/${projectId}/invitations/`, {
    token,
  })
}

export function cancelProjectInvitation(
  token: string,
  projectId: string,
  invitationId: string,
) {
  return apiFetch<void>(
    `/projects/${projectId}/invitations/${invitationId}/`,
    { method: 'DELETE', token },
  )
}

export function acceptInvitation(token: string, inviteToken: string) {
  return apiFetch<Invitation>(`/invitations/${inviteToken}/accept/`, {
    method: 'POST',
    token,
  })
}

export function declineInvitation(token: string, inviteToken: string) {
  return apiFetch<Invitation>(`/invitations/${inviteToken}/decline/`, {
    method: 'POST',
    token,
  })
}

export function createProjectInvitation(
  token: string,
  projectId: string,
  body: InvitationCreateInput,
) {
  return apiFetch<Invitation>(`/projects/${projectId}/invitations/`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}
