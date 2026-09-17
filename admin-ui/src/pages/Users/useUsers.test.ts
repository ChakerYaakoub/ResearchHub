import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUsers } from './useUsers'

const listResearchersMock = vi.fn()

vi.mock('../../api/admin', () => ({
  listResearchers: (...args: unknown[]) => listResearchersMock(...args),
  patchUser: vi.fn(),
}))

vi.mock('../../auth', () => ({
  useAuth: () => ({
    access: 'tok',
    user: { id: 'me-id', email: 'me@example.com', role: 'ADMIN' },
  }),
}))

vi.mock('../../hooks/useAdminListParams', () => ({
  useAdminListParams: () => ({
    filters: { search: '', is_active: '' },
    searchInput: '',
    setSearchInput: vi.fn(),
    isActive: '',
    setIsActive: vi.fn(),
    hasActiveFilters: false,
  }),
}))

vi.mock('../../notify', () => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
}))

describe('useUsers', () => {
  beforeEach(() => {
    listResearchersMock.mockReset()
  })

  it('loads researchers into users list', async () => {
    listResearchersMock.mockResolvedValue([
      {
        id: 'u1',
        email: 'r@example.com',
        username: 'r',
        role: 'RESEARCHER',
        is_active: true,
        date_joined: '2026-01-01T00:00:00Z',
      },
    ])

    const { result } = renderHook(() => useUsers())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(listResearchersMock).toHaveBeenCalledWith('tok', {
      search: '',
      is_active: undefined,
    })
    expect(result.current.users).toHaveLength(1)
    expect(result.current.users[0].email).toBe('r@example.com')
  })

  it('shows empty list when API returns none', async () => {
    listResearchersMock.mockResolvedValue([])
    const { result } = renderHook(() => useUsers())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.users).toEqual([])
  })
})
