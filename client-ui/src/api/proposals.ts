import { apiFetch, ApiError } from './client'
import type { Proposal, ProposalInput } from '../types/api'

/** Paths relative to VITE_API_BASE_URL (/api). */

export async function getProposal(
  token: string,
  projectId: number | string,
): Promise<Proposal | null> {
  try {
    return await apiFetch<Proposal>(`/projects/${projectId}/proposal/`, {
      token,
    })
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export function createProposal(
  token: string,
  projectId: number | string,
  body: ProposalInput,
) {
  return apiFetch<Proposal>(`/projects/${projectId}/proposal/`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export function updateProposal(
  token: string,
  projectId: number | string,
  body: ProposalInput,
) {
  return apiFetch<Proposal>(`/projects/${projectId}/proposal/`, {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  })
}

export function submitProposal(token: string, projectId: number | string) {
  return apiFetch<Proposal>(`/projects/${projectId}/proposal/submit/`, {
    method: 'POST',
    token,
  })
}
