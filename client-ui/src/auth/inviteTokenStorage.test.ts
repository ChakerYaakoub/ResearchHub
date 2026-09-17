import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearInviteToken,
  getInviteToken,
  setInviteToken,
} from './inviteTokenStorage'

describe('inviteTokenStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns null when nothing stored', () => {
    expect(getInviteToken()).toBeNull()
  })

  it('saves and reads invite token', () => {
    setInviteToken('abc')
    expect(getInviteToken()).toBe('abc')
  })

  it('clears invite token', () => {
    setInviteToken('abc')
    clearInviteToken()
    expect(getInviteToken()).toBeNull()
  })
})
