import { apiFetch } from '../api/client'
import type { AuthTokens, AuthUser } from './authStorage'

export async function registerRequest(
  email: string,
  password: string,
  company = '',
): Promise<AuthTokens> {
  return apiFetch<AuthTokens>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ email, password, company }),
  })
}

export async function loginRequest(
  email: string,
  password: string,
  company = '',
): Promise<AuthTokens> {
  return apiFetch<AuthTokens>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password, company }),
  })
}

export async function logoutRequest(
  access: string,
  refresh: string,
): Promise<void> {
  await apiFetch('/auth/logout/', {
    method: 'POST',
    token: access,
    body: JSON.stringify({ refresh }),
  })
}

export async function meRequest(access: string): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me/', { token: access })
}

export type MeUpdateBody = {
  username?: string
  first_name?: string
  last_name?: string
  current_password?: string
  new_password?: string
}

export async function updateMeRequest(
  access: string,
  body: MeUpdateBody,
): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me/', {
    method: 'PATCH',
    token: access,
    body: JSON.stringify(body),
  })
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch('/auth/password-reset/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function confirmPasswordReset(body: {
  uid: string
  token: string
  new_password: string
}): Promise<void> {
  await apiFetch('/auth/password-reset/confirm/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
