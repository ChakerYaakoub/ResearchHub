/**
 * Project REST helpers (`/projects/…`).
 * Paths are relative to VITE_API_BASE_URL (includes `/api`).
 */
import { apiFetch } from './client'
import type {
  Project,
  ProjectCreateInput,
  ProjectMembership,
} from '../types/api'

export function listProjects(token: string) {
  return apiFetch<Project[]>('/projects/', { token })
}

export function getProject(token: string, id: string) {
  return apiFetch<Project>(`/projects/${id}/`, { token })
}

export function createProject(token: string, body: ProjectCreateInput) {
  return apiFetch<Project>('/projects/', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export function listCollaborators(token: string, projectId: string) {
  return apiFetch<ProjectMembership[]>(
    `/projects/${projectId}/collaborators/`,
    { token },
  )
}

export function completeProject(token: string, projectId: string) {
  return apiFetch<Project>(`/projects/${projectId}/complete/`, {
    method: 'POST',
    token,
  })
}

export function deleteProject(token: string, projectId: string) {
  return apiFetch<void>(`/projects/${projectId}/`, {
    method: 'DELETE',
    token,
  })
}
