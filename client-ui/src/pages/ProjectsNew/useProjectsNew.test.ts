/**
 * ProjectsNew hook: createProject success navigates to `/projects/:id` and toasts.
 */
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProjectsNew } from './useProjectsNew'

const createProjectMock = vi.fn()
const navigateMock = vi.fn()
const notifySuccessMock = vi.fn()
const notifyErrorMock = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}))

vi.mock('../../auth', () => ({
  useAuth: () => ({ access: 'tok' }),
}))

vi.mock('../../api/projects', () => ({
  createProject: (...args: unknown[]) => createProjectMock(...args),
}))

vi.mock('../../notify', () => ({
  notifySuccess: (...args: unknown[]) => notifySuccessMock(...args),
  notifyError: (...args: unknown[]) => notifyErrorMock(...args),
}))

describe('useProjectsNew', () => {
  beforeEach(() => {
    createProjectMock.mockReset()
    navigateMock.mockReset()
    notifySuccessMock.mockReset()
    notifyErrorMock.mockReset()
  })

  it('creates a project and navigates to detail', async () => {
    createProjectMock.mockResolvedValue({
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    })
    const { result } = renderHook(() => useProjectsNew())

    await act(async () => {
      await result.current.onSubmit(
        {
          title: ' My Project ',
          description: 'd',
          scientific_objective: 'o',
        },
        { setSubmitting: vi.fn() } as never,
      )
    })

    expect(createProjectMock).toHaveBeenCalledWith('tok', {
      title: 'My Project',
      description: 'd',
      scientific_objective: 'o',
    })
    expect(notifySuccessMock).toHaveBeenCalledWith('toast.created')
    expect(navigateMock).toHaveBeenCalledWith(
      '/projects/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      { replace: true },
    )
  })
})
