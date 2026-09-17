import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RequireAuth } from './RequireAuth'

const useAuthMock = vi.fn()

vi.mock('../../auth', () => ({
  useAuth: () => useAuthMock(),
}))

function renderGuard(initialPath = '/users') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>login-page</div>} />
        <Route element={<RequireAuth />}>
          <Route path="/users" element={<div>users-page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  beforeEach(() => {
    useAuthMock.mockReset()
  })

  it('redirects to /login when unauthenticated', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false })
    renderGuard()
    expect(screen.getByText('login-page')).toBeInTheDocument()
    expect(screen.queryByText('users-page')).not.toBeInTheDocument()
  })

  it('renders outlet when authenticated', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true })
    renderGuard()
    expect(screen.getByText('users-page')).toBeInTheDocument()
  })
})
