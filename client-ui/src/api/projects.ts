import { apiFetch } from './client'
import type {
  Project,
  ProjectCreateInput,
  ProjectMembership,
} from '../types/api'

export function listProjects(token: string) {
  return apiFetch<Project[]>('/api/projects/', { token })
}

export function getProject(token: string, id: number | string) {
  return apiFetch<Project>(`/api/projects/${id}/`, { token })
}

export function createProject(token: string, body: ProjectCreateInput) {
  return apiFetch<Project>('/api/projects/', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export function listCollaborators(token: string, projectId: number | string) {
  return apiFetch<ProjectMembership[]>(
    `/api/projects/${projectId}/collaborators/`,
    { token },
  )
}
