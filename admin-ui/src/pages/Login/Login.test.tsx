/**
 * Login page smoke: heading and email/password fields render (hook mocked).
 */
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './Login'
import { copy } from '../../copy'

vi.mock('./useLogin', () => ({
  useLogin: () => ({
    copy,
    isAuthenticated: false,
    initialValues: { email: '', password: '' },
    validationSchema: undefined,
    onSubmit: vi.fn(),
  }),
}))

vi.mock('../../components/DocumentTitle', () => ({
  DocumentTitle: () => null,
}))

describe('LoginPage', () => {
  it('renders admin sign-in fields', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: copy.loginTitle })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(document.querySelector('input#password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: copy.loginSubmit }),
    ).toBeInTheDocument()
  })
})
