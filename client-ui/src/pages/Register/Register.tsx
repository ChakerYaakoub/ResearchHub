import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth'
import './Register.css'

/** Registration against `/api/auth/register/`. */
export function RegisterPage() {
  const { t } = useTranslation()
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      await register(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t('errors.registerFailed'),
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="auth-page mx-auto">
        <div className="auth-card p-4">
          <h1 className="auth-title h3 mb-3">{t('register.title')}</h1>
          <p className="text-muted small mb-4">{t('register.subtitle')}</p>
          {error ? (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          ) : null}
          <form onSubmit={onSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="register-email">
                {t('common.email')}
              </label>
              <input
                id="register-email"
                className="form-control"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="register-password">
                {t('common.password')}
              </label>
              <input
                id="register-password"
                className="form-control"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="form-text">{t('register.passwordHint')}</div>
            </div>
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={pending}
            >
              {pending ? t('register.submitting') : t('register.submit')}
            </button>
          </form>
          <p className="mt-3 mb-0 small text-muted">
            {t('register.haveAccount')}{' '}
            <Link to="/login">{t('register.loginLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
