import { apiFetch } from './client'
import type {
  Invitation,
  InvitationCreateInput,
} from '../types/api'

export function listMyInvitations(token: string) {
  return apiFetch<Invitation[]>('/api/invitations/', { token })
}

export function acceptInvitation(token: string, inviteToken: string) {
  return apiFetch<Invitation>(`/api/invitations/${inviteToken}/accept/`, {
    method: 'POST',
    token,
  })
}

export function declineInvitation(token: string, inviteToken: string) {
  return apiFetch<Invitation>(`/api/invitations/${inviteToken}/decline/`, {
    method: 'POST',
    token,
  })
}

export function createProjectInvitation(
  token: string,
  projectId: number | string,
  body: InvitationCreateInput,
) {
  return apiFetch<Invitation>(`/api/projects/${projectId}/invitations/`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}
