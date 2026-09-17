import { Link, NavLink, Outlet } from 'react-router-dom'
import { DocumentTitle } from '../DocumentTitle'
import { useDashboardLayout } from './useDashboardLayout'
import './DashboardLayout.css'

/** Logged-in admin shell with sidebar + top header. */
export function DashboardLayout() {
  const vm = useDashboardLayout()

  return (
    <div className={`rh-dash${vm.sidebarOpen ? ' is-open' : ''}`}>
      <DocumentTitle title={`${vm.pageTitle} — ResearchHub Admin`} />
      <button
        type="button"
        className="rh-dash-backdrop"
        aria-label={vm.copy.close}
        tabIndex={vm.sidebarOpen ? 0 : -1}
        onClick={vm.closeSidebar}
      />

      <aside className="rh-dash-sidebar d-flex flex-column">
        <div className="rh-dash-brand mb-3">
          <Link to="/" onClick={vm.closeSidebar}>
            {vm.copy.brand}
          </Link>
        </div>
        <nav aria-label={vm.copy.dashboard}>
          {vm.sections.map((section) => (
            <div key={section.id} className="rh-dash-nav-section">
              {section.label ? (
                <p className="rh-dash-nav-heading">{section.label}</p>
              ) : null}
              <ul className="rh-dash-nav list-unstyled mb-0">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `rh-dash-link${isActive ? ' is-active' : ''}`
                      }
                      onClick={vm.closeSidebar}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="rh-dash-main d-flex flex-column min-vh-100">
        <header className="rh-dash-header">
          <div className="rh-dash-header-start">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rh-dash-menu-btn"
              aria-label={vm.copy.toggleNav}
              aria-expanded={vm.sidebarOpen}
              onClick={vm.toggleSidebar}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"
                />
              </svg>
            </button>
            <h1 className="rh-dash-header-title h5 mb-0">{vm.pageTitle}</h1>
          </div>

          <div className="rh-dash-header-end">
            {vm.user ? (
              <span className="rh-dash-header-user" title={vm.user.email}>
                {vm.user.email}
              </span>
            ) : null}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => void vm.onLogout()}
            >
              {vm.copy.logOut}
            </button>
          </div>
        </header>

        <main className="rh-dash-content flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
