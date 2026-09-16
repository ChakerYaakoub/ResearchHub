import { apiFetch } from './client'
import type { Experiment, ExperimentInput } from '../types/api'

export function listExperiments(token: string, projectId: number | string) {
  return apiFetch<Experiment[]>(`/projects/${projectId}/experiments/`, {
    token,
  })
}

export function createExperiment(
  token: string,
  projectId: number | string,
  body: ExperimentInput,
) {
  return apiFetch<Experiment>(`/projects/${projectId}/experiments/`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  })
}

export function updateExperiment(
  token: string,
  experimentId: number | string,
  body: Partial<ExperimentInput>,
) {
  return apiFetch<Experiment>(`/experiments/${experimentId}/`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  })
}

export function deleteExperiment(token: string, experimentId: number | string) {
  return apiFetch<void>(`/experiments/${experimentId}/`, {
    method: 'DELETE',
    token,
  })
}
