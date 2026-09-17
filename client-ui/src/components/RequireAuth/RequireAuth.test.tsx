/**
 * RequireAuth UX gate: unauthenticated → home + login modal flag; authenticated → outlet.
 */
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RequireAuth } from './RequireAuth'

const useAuthMock = vi.fn()
const requestLoginModalMock = vi.fn()

vi.mock('../../auth', () => ({
  useAuth: () => useAuthMock(),
}))

vi.mock('../AuthUi', () => ({
  requestLoginModal: () => requestLoginModalMock(),
}))

function renderGuard(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>home</div>} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<div>secret</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  beforeEach(() => {
    useAuthMock.mockReset()
    requestLoginModalMock.mockReset()
  })

  it('redirects to home and requests login modal when unauthenticated', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false })
    renderGuard()
    expect(screen.getByText('home')).toBeInTheDocument()
    expect(screen.queryByText('secret')).not.toBeInTheDocument()
    expect(requestLoginModalMock).toHaveBeenCalled()
  })

  it('renders outlet when authenticated', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true })
    renderGuard()
    expect(screen.getByText('secret')).toBeInTheDocument()
    expect(requestLoginModalMock).not.toHaveBeenCalled()
  })
})
