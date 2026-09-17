/**
 * Proposal REST helpers. GET returns null on 404 (no proposal yet).
 */
import { apiFetch, ApiError } from './client'
import type { Proposal, ProposalInput } from '../types/api'

export async function getProposal(
  token: string,
  projectId: string,
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
  projectId: string,
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
  projectId: string,
  body: ProposalInput,
) {
  return apiFetch<Proposal>(`/projects/${projectId}/proposal/`, {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  })
}

export function submitProposal(token: string, projectId: string) {
  return apiFetch<Proposal>(`/projects/${projectId}/proposal/submit/`, {
    method: 'POST',
    token,
  })
}
