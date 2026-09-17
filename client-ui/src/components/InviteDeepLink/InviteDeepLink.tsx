import { useInviteDeepLink } from './useInviteDeepLink'

/** Side-effect host for invitation email deep links (renders nothing). */
export function InviteDeepLink() {
  useInviteDeepLink()
  return null
}
