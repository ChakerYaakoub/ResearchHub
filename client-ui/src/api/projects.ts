import { apiFetch } from './client'
import type {
  Project,
  ProjectCreateInput,
  ProjectMembership,
} from '../types/api'

/** Paths are relative to VITE_API_BASE_URL (already ends with /api). */

export function listProjects(token: string) {
  return apiFetch<Project[]>('/projects/', { token })
}

export function getProject(token: string, id: number | string) {
  return apiFetch<Project>(`/projects/${id}/`, { token })
}

export function createProject(token: string, body: ProjectCreateInput) {
  return apiFetch<Project>('/projects/', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export function listCollaborators(token: string, projectId: number | string) {
  return apiFetch<ProjectMembership[]>(
    `/projects/${projectId}/collaborators/`,
    { token },
  )
}
