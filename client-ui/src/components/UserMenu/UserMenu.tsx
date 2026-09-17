import { Link } from 'react-router-dom'
import { useUserMenu } from './useUserMenu'
import './UserMenu.css'

export type UserMenuProps = {
  email?: string | null
  accountLabel: string
  logoutLabel: string
  menuLabel: string
  onLogout: () => void | Promise<void>
}

/** Header account icon with Account + Log out dropdown. */
export function UserMenu({
  email,
  accountLabel,
  logoutLabel,
  menuLabel,
  onLogout,
}: UserMenuProps) {
  const vm = useUserMenu({ onLogout })

  return (
    <div className="dropdown rh-user-menu" ref={vm.rootRef}>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm rh-user-menu-toggle"
        aria-label={menuLabel}
        aria-expanded={vm.open}
        aria-haspopup="menu"
        onClick={vm.toggle}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2h19.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z"
          />
        </svg>
      </button>
      {vm.open ? (
        <ul
          className="dropdown-menu dropdown-menu-end show rh-user-menu-panel"
          role="menu"
        >
          {email ? (
            <li>
              <span className="dropdown-item-text small text-muted text-truncate d-block">
                {email}
              </span>
            </li>
          ) : null}
          <li>
            <Link
              className="dropdown-item"
              to="/account"
              role="menuitem"
              onClick={vm.close}
            >
              {accountLabel}
            </Link>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button
              type="button"
              className="dropdown-item"
              role="menuitem"
              onClick={() => void vm.handleLogout()}
            >
              {logoutLabel}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}
