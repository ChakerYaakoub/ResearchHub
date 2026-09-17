import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getInviteToken } from '../../auth/inviteTokenStorage'
import { useInviteDeepLink } from './useInviteDeepLink'

const navigateMock = vi.fn()
const openLoginMock = vi.fn()
const openRegisterMock = vi.fn()
let searchParams = new URLSearchParams()
let isAuthenticated = false

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useSearchParams: () => [searchParams],
}))

vi.mock('../../auth', () => ({
  useAuth: () => ({ isAuthenticated }),
}))

vi.mock('../AuthUi', () => ({
  useAuthUi: () => ({
    openLogin: openLoginMock,
    openRegister: openRegisterMock,
  }),
}))

describe('useInviteDeepLink', () => {
  beforeEach(() => {
    sessionStorage.clear()
    navigateMock.mockReset()
    openLoginMock.mockReset()
    openRegisterMock.mockReset()
    searchParams = new URLSearchParams()
    isAuthenticated = false
  })

  it('stores token, strips query, and opens login modal', () => {
    searchParams = new URLSearchParams('auth=login&token=tok-1')
    renderHook(() => useInviteDeepLink())

    expect(getInviteToken()).toBe('tok-1')
    expect(navigateMock).toHaveBeenCalledWith(
      { pathname: '/', search: '' },
      { replace: true },
    )
    expect(openLoginMock).toHaveBeenCalled()
    expect(openRegisterMock).not.toHaveBeenCalled()
  })

  it('opens register modal when auth=register', () => {
    searchParams = new URLSearchParams('auth=register&token=tok-2')
    renderHook(() => useInviteDeepLink())

    expect(getInviteToken()).toBe('tok-2')
    expect(openRegisterMock).toHaveBeenCalled()
    expect(openLoginMock).not.toHaveBeenCalled()
  })

  it('navigates to invitations when already authenticated', () => {
    isAuthenticated = true
    searchParams = new URLSearchParams('auth=login&token=tok-3')
    renderHook(() => useInviteDeepLink())

    expect(getInviteToken()).toBe('tok-3')
    expect(openLoginMock).not.toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith('/invitations', { replace: true })
  })

  it('does nothing without auth or token params', () => {
    renderHook(() => useInviteDeepLink())
    expect(getInviteToken()).toBeNull()
    expect(navigateMock).not.toHaveBeenCalled()
    expect(openLoginMock).not.toHaveBeenCalled()
  })
})
