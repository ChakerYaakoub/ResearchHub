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

export type AdminProposal = {
  id: number
  project: number
  project_title: string
  methodology: string
  expected_results: string
  submitted_at: string | null
  status: string
}

export function getAdminStats(token: string) {
  return apiFetch<AdminStats>('/admin/stats/', { token })
}

export function listPendingProposals(token: string) {
  return apiFetch<AdminProposal[]>('/admin/proposals/', { token })
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
