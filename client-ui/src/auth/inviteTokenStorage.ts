/** Session-only invite token from email deep links (cleared after handle). */

const INVITE_TOKEN_KEY = 'rh_invite_token'

export function getInviteToken(): string | null {
  return sessionStorage.getItem(INVITE_TOKEN_KEY)
}

export function setInviteToken(token: string): void {
  sessionStorage.setItem(INVITE_TOKEN_KEY, token)
}

export function clearInviteToken(): void {
  sessionStorage.removeItem(INVITE_TOKEN_KEY)
}
