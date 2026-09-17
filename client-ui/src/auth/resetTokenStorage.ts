/** Session storage for password-reset deep links (?auth=reset&uid=&token=). */

const RESET_UID_KEY = 'rh_reset_uid'
const RESET_TOKEN_KEY = 'rh_reset_token'

export function getResetCredentials(): { uid: string; token: string } | null {
  const uid = sessionStorage.getItem(RESET_UID_KEY)
  const token = sessionStorage.getItem(RESET_TOKEN_KEY)
  if (!uid || !token) return null
  return { uid, token }
}

export function setResetCredentials(uid: string, token: string): void {
  sessionStorage.setItem(RESET_UID_KEY, uid)
  sessionStorage.setItem(RESET_TOKEN_KEY, token)
}

export function clearResetCredentials(): void {
  sessionStorage.removeItem(RESET_UID_KEY)
  sessionStorage.removeItem(RESET_TOKEN_KEY)
}
