/** Auth types and localStorage keys (admin-ui origin only). */

export type AuthUser = {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  role: string
}

export type AuthTokens = {
  access: string
  refresh: string
  user: AuthUser
}

/** Roles allowed into admin-ui. */
export function isPlatformAdminRole(role: string): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN'
}

const ACCESS_KEY = 'rh_admin_access'
const REFRESH_KEY = 'rh_admin_refresh'
const USER_KEY = 'rh_admin_user'

export function loadStoredAuth(): {
  access: string
  refresh: string
  user: AuthUser
} | null {
  const access = localStorage.getItem(ACCESS_KEY)
  const refresh = localStorage.getItem(REFRESH_KEY)
  const raw = localStorage.getItem(USER_KEY)
  if (!access || !refresh || !raw) return null
  try {
    const user = JSON.parse(raw) as AuthUser
    return { access, refresh, user }
  } catch {
    return null
  }
}

export function saveAuth(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_KEY, tokens.access)
  localStorage.setItem(REFRESH_KEY, tokens.refresh)
  localStorage.setItem(USER_KEY, JSON.stringify(tokens.user))
}

/** Update JWT pair after silent refresh (keeps stored user). */
export function updateStoredTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

/** Keep JWT pair; replace stored user after profile update. */
export function updateStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}
