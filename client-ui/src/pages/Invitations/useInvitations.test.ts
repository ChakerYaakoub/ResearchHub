import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Invitation } from '../../types/api'
import { useInvitations } from './useInvitations'

const listMock = vi.fn()
const acceptMock = vi.fn()
const declineMock = vi.fn()
const notifySuccessMock = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}))

vi.mock('../../auth', () => ({
  useAuth: () => ({ access: 'tok' }),
}))

vi.mock('../../api/invitations', () => ({
  listMyInvitations: (...args: unknown[]) => listMock(...args),
  acceptInvitation: (...args: unknown[]) => acceptMock(...args),
  declineInvitation: (...args: unknown[]) => declineMock(...args),
}))

vi.mock('../../notify', () => ({
  notifySuccess: (...args: unknown[]) => notifySuccessMock(...args),
  notifyError: vi.fn(),
}))

const invite: Invitation = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  project: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  project_title: 'P',
  email: 'a@example.com',
  invited_by: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  invited_by_email: 'owner@example.com',
  role: 'EDITOR',
  status: 'PENDING',
  expires_at: '2099-01-01T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  accepted_at: null,
  token: 'invite-token',
}

describe('useInvitations', () => {
  beforeEach(() => {
    sessionStorage.clear()
    listMock.mockReset()
    acceptMock.mockReset()
    declineMock.mockReset()
    notifySuccessMock.mockReset()
    listMock.mockResolvedValue([invite])
    acceptMock.mockResolvedValue(invite)
    declineMock.mockResolvedValue(invite)
  })

  it('loads invitations on mount', async () => {
    const { result } = renderHook(() => useInvitations())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(listMock).toHaveBeenCalledWith('tok')
    expect(result.current.pending).toHaveLength(1)
  })

  it('accepts an invitation and reloads', async () => {
    sessionStorage.setItem('rh_invite_token', 'invite-token')
    const { result } = renderHook(() => useInvitations())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.onAccept(invite)
    })

    expect(acceptMock).toHaveBeenCalledWith('tok', 'invite-token')
    expect(notifySuccessMock).toHaveBeenCalledWith('toast.accepted')
    expect(listMock.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(sessionStorage.getItem('rh_invite_token')).toBeNull()
  })

  it('declines an invitation and reloads', async () => {
    sessionStorage.setItem('rh_invite_token', 'invite-token')
    const { result } = renderHook(() => useInvitations())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.onDecline(invite)
    })

    expect(declineMock).toHaveBeenCalledWith('tok', 'invite-token')
    expect(notifySuccessMock).toHaveBeenCalledWith('toast.declined')
    expect(sessionStorage.getItem('rh_invite_token')).toBeNull()
  })

  it('exposes highlightToken from sessionStorage', async () => {
    sessionStorage.setItem('rh_invite_token', 'invite-token')
    const { result } = renderHook(() => useInvitations())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.highlightToken).toBe('invite-token')
  })
})
