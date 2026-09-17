/** Publication REST helpers nested under projects + detail by id. */

import { apiFetch } from './client'
import type { Publication, PublicationInput } from '../types/api'

export function listPublications(token: string, projectId: string) {
  return apiFetch<Publication[]>(`/projects/${projectId}/publications/`, {
    token,
  })
}

export function createPublication(
  token: string,
  projectId: string,
  body: PublicationInput,
) {
  return apiFetch<Publication>(`/projects/${projectId}/publications/`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export function updatePublication(
  token: string,
  publicationId: string,
  body: Partial<PublicationInput>,
) {
  return apiFetch<Publication>(`/publications/${publicationId}/`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  })
}

export function deletePublication(
  token: string,
  publicationId: string,
) {
  return apiFetch<void>(`/publications/${publicationId}/`, {
    method: 'DELETE',
    token,
  })
}
