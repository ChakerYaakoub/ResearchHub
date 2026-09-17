/**
 * Unit tests for JWT/user persistence in localStorage (`rh_access`, `rh_refresh`, `rh_user`).
 */
import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearAuth,
  loadStoredAuth,
  saveAuth,
  type AuthTokens,
} from './authStorage'

const sampleUser = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'a@example.com',
  username: 'a',
  first_name: '',
  last_name: '',
  role: 'RESEARCHER',
}

const tokens: AuthTokens = {
  access: 'access-token',
  refresh: 'refresh-token',
  user: sampleUser,
}

describe('authStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing stored', () => {
    expect(loadStoredAuth()).toBeNull()
  })

  it('saves and loads auth', () => {
    saveAuth(tokens)
    expect(loadStoredAuth()).toEqual(tokens)
  })

  it('clears auth', () => {
    saveAuth(tokens)
    clearAuth()
    expect(loadStoredAuth()).toBeNull()
  })
})
