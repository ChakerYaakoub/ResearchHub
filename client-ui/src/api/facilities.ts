import { apiFetch } from './client'
import type { Installation, Instrument } from '../types/api'

export function listInstallations(token: string) {
  return apiFetch<Installation[]>('/installations/', { token })
}

export function listInstruments(token: string, installationId?: number) {
  const q =
    installationId != null ? `?installation=${installationId}` : ''
  return apiFetch<Instrument[]>(`/instruments/${q}`, { token })
}
