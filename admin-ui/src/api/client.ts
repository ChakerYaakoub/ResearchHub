/**
 * Shared fetch for ResearchHub REST: Bearer token, 401 → single-flight refresh → retry.
 * Base URL: VITE_API_BASE_URL (must include `/api`).
 */
import { copy } from '../copy'
import { ensureFreshAccess, isAuthPath } from '../auth/tokenSession'

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown, message: string) {
    super(message)
    this.status = status
    this.body = body
  }
}

/** Pull a human-readable message from DRF error payloads. */
function messagesFromValue(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  return []
}

export function formatApiError(body: unknown, fallback?: string): string {
  const fb = fallback ?? copy.requestFailed
  if (!body || typeof body !== 'object') return fb
  const data = body as Record<string, unknown>
  if (typeof data.detail === 'string') return data.detail
  if (Array.isArray(data.detail)) return data.detail.map(String).join(' ')

  const parts: string[] = []
  for (const [key, value] of Object.entries(data)) {
    const msgs = messagesFromValue(value)
    if (!msgs.length) continue
    // DRF non-field / form-level errors — show message only (no key prefix).
    if (key === 'non_field_errors' || key === '__all__') {
      parts.push(...msgs)
      continue
    }
    // Prefer message-only when a single field has one message.
    if (msgs.length === 1) {
      parts.push(msgs[0])
    } else {
      parts.push(msgs.join(' '))
    }
  }
  return parts.length ? parts.join(' ') : fb
}

type ApiFetchOptions = RequestInit & {
  token?: string | null
  /** Skip 401 → refresh → retry (auth endpoints / already-retried). */
  skipAuthRefresh?: boolean
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!response.ok) {
    const message =
      response.status === 429
        ? copy.rateLimited
        : formatApiError(body, `HTTP ${response.status}`)
    throw new ApiError(response.status, body, message)
  }

  return body as T
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, headers: initHeaders, skipAuthRefresh, ...rest } = options
  const headers = new Headers(initHeaders)
  if (!headers.has('Content-Type') && rest.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  const response = await fetch(url, { ...rest, headers })

  if (
    response.status === 401 &&
    token &&
    !skipAuthRefresh &&
    !isAuthPath(path)
  ) {
    try {
      const access = await ensureFreshAccess()
      return apiFetch<T>(path, {
        ...options,
        token: access,
        skipAuthRefresh: true,
      })
    } catch {
      // Fall through with original 401 body.
    }
  }

  return parseResponse<T>(response)
}
