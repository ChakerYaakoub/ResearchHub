/** Auth HTTP helpers for `/auth/*` (register, login, me, password reset). */

import { apiFetch } from '../api/client'
import type { AuthTokens, AuthUser } from './authStorage'

/** POST `/auth/register/` — optional honeypot `company` (must be empty for humans). */
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

/** POST `/auth/login/` — optional honeypot `company`. */
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

/** POST `/auth/logout/` — blacklist refresh; ignores API errors at call sites. */
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

/** GET `/auth/me/` — current user profile. */
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

/** PATCH `/auth/me/` — profile and optional password change. */
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

/** POST `/auth/password-reset/` — always succeeds from the client view (anti-enumeration). */
export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch('/auth/password-reset/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

/** POST `/auth/password-reset/confirm/` — uid + token from email deep link. */
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
