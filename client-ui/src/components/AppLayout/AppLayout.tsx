import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth'
import './AppLayout.css'

export type NavItem = {
  to: string
  label: string
}

export const mainNavItems: NavItem[] = [
  { to: '/facilities', label: 'Facilities' },
  { to: '/instruments', label: 'Instruments' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/documentation', label: 'Documentation' },
]

/** Public shell: responsive navbar, page outlet, footer. */
export function AppLayout() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const close = () => setOpen(false)

  async function onLogout() {
    close()
    await logout()
  }

  return (
    <div className="rh-layout">
      <nav className="navbar navbar-expand-lg rh-navbar sticky-top">
        <div className="container">
          <Link className="navbar-brand rh-brand" to="/" onClick={close}>
            ResearchHub
          </Link>
          <button
            type="button"
            className="rh-toggler d-lg-none"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="rh-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse${open ? ' show' : ''}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-1">
              {mainNavItems.map((item) => (
                <li className="nav-item" key={item.to}>
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link rh-nav-link${isActive ? ' active' : ''}`
                    }
                    to={item.to}
                    onClick={close}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="d-flex flex-column flex-lg-row gap-2 align-items-lg-center">
              {isAuthenticated && user ? (
                <>
                  <span className="small text-muted text-truncate" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={onLogout}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="btn btn-outline-secondary btn-sm"
                    to="/login"
                    onClick={close}
                  >
                    Log in
                  </Link>
                  <Link
                    className="btn btn-primary btn-sm"
                    to="/register"
                    onClick={close}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="rh-main">
        <Outlet />
      </main>

      <footer className="rh-footer py-4 mt-auto">
        <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
          <span>ResearchHub — scientific project &amp; experiment management</span>
          <span className="text-muted">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
