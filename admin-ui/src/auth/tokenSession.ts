/** Silent JWT refresh: single-flight + localStorage sync (admin-ui). */

import {
  clearAuth,
  loadStoredAuth,
  updateStoredTokens,
} from './authStorage'

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

type TokenPair = { access: string; refresh: string }

type TokensListener = (tokens: TokenPair | null) => void

const listeners = new Set<TokensListener>()

let inflight: Promise<string> | null = null

export function onAuthTokensChange(listener: TokensListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function notify(tokens: TokenPair | null): void {
  for (const listener of listeners) listener(tokens)
}

function clearSession(): void {
  clearAuth()
  notify(null)
}

/** Refresh access (and rotated refresh). One in-flight call for concurrent 401s. */
export function ensureFreshAccess(): Promise<string> {
  if (!inflight) {
    inflight = refreshOnce().finally(() => {
      inflight = null
    })
  }
  return inflight
}

async function refreshOnce(): Promise<string> {
  const stored = loadStoredAuth()
  if (!stored?.refresh) {
    clearSession()
    throw new Error('No refresh token')
  }

  const response = await fetch(`${baseUrl}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: stored.refresh }),
  })

  if (!response.ok) {
    clearSession()
    throw new Error('Refresh failed')
  }

  const data = (await response.json()) as {
    access?: string
    refresh?: string
  }
  if (!data.access) {
    clearSession()
    throw new Error('Refresh returned no access token')
  }

  const nextRefresh = data.refresh ?? stored.refresh
  updateStoredTokens(data.access, nextRefresh)
  notify({ access: data.access, refresh: nextRefresh })
  return data.access
}

export function isAuthPath(path: string): boolean {
  const p = path.startsWith('/') ? path : `/${path}`
  return (
    p.startsWith('/auth/login') ||
    p.startsWith('/auth/register') ||
    p.startsWith('/auth/refresh') ||
    p.startsWith('/auth/logout')
  )
}
