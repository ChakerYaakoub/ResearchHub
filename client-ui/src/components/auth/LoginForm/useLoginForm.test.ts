import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../api/client'
import { useLoginForm } from './useLoginForm'

const loginMock = vi.fn()
const notifyErrorMock = vi.fn()
const onSuccess = vi.fn()
const onSwitchToRegister = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}))

vi.mock('../../../auth', () => ({
  useAuth: () => ({ login: loginMock }),
}))

vi.mock('../../../notify', () => ({
  notifyError: (...args: unknown[]) => notifyErrorMock(...args),
}))

describe('useLoginForm', () => {
  beforeEach(() => {
    loginMock.mockReset()
    notifyErrorMock.mockReset()
    onSuccess.mockReset()
  })

  it('calls login and onSuccess on submit', async () => {
    loginMock.mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useLoginForm({ onSuccess, onSwitchToRegister }),
    )
    const helpers = { setSubmitting: vi.fn() }

    await act(async () => {
      await result.current.onSubmit(
        { email: ' a@example.com ', password: 'secret' },
        helpers as never,
      )
    })

    expect(loginMock).toHaveBeenCalledWith('a@example.com', 'secret')
    expect(onSuccess).toHaveBeenCalled()
    expect(helpers.setSubmitting).toHaveBeenCalledWith(false)
  })

  it('notifies on ApiError and does not call onSuccess', async () => {
    loginMock.mockRejectedValue(new ApiError(401, {}, 'bad creds'))
    const { result } = renderHook(() =>
      useLoginForm({ onSuccess, onSwitchToRegister }),
    )

    await act(async () => {
      await result.current.onSubmit(
        { email: 'a@example.com', password: 'x' },
        { setSubmitting: vi.fn() } as never,
      )
    })

    expect(onSuccess).not.toHaveBeenCalled()
    expect(notifyErrorMock).toHaveBeenCalledWith('bad creds')
  })
})
