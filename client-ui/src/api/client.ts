import i18n from '../i18n'

/** Thin fetch wrapper for ResearchHub REST API. */

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
export function formatApiError(body: unknown, fallback?: string): string {
  const fb = fallback ?? i18n.t('errors.requestFailed')
  if (!body || typeof body !== 'object') return fb
  const data = body as Record<string, unknown>
  if (typeof data.detail === 'string') return data.detail
  if (Array.isArray(data.detail)) return data.detail.map(String).join(' ')
  const parts: string[] = []
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) parts.push(`${key}: ${value.map(String).join(' ')}`)
    else if (typeof value === 'string') parts.push(`${key}: ${value}`)
  }
  return parts.length ? parts.join(' ') : fb
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers: initHeaders, ...rest } = options
  const headers = new Headers(initHeaders)
  if (!headers.has('Content-Type') && rest.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  const response = await fetch(url, { ...rest, headers })

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
    throw new ApiError(
      response.status,
      body,
      formatApiError(body, `HTTP ${response.status}`),
    )
  }

  return body as T
}
