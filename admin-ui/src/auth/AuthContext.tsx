/**
 * JWT session for platform admins only (`SUPER_ADMIN` | `ADMIN`).
 * Researchers who authenticate at the API are rejected here (UX); backend AuthZ remains authoritative.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError } from '../api/client'
import { loginRequest, logoutRequest } from '../api/auth'
import { copy } from '../copy'
import {
  clearAuth,
  isPlatformAdminRole,
  loadStoredAuth,
  saveAuth,
  updateStoredUser,
  type AuthUser,
} from './authStorage'
import { onAuthTokensChange } from './tokenSession'

type AuthContextValue = {
  user: AuthUser | null
  access: string | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readInitialAuth() {
  const initial = loadStoredAuth()
  if (!initial) return { user: null, access: null, refresh: null }
  if (!isPlatformAdminRole(initial.user.role)) {
    clearAuth()
    return { user: null, access: null, refresh: null }
  }
  return {
    user: initial.user,
    access: initial.access,
    refresh: initial.refresh,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = readInitialAuth()
  const [user, setUser] = useState<AuthUser | null>(initial.user)
  const [access, setAccess] = useState<string | null>(initial.access)
  const [refresh, setRefresh] = useState<string | null>(initial.refresh)

  useEffect(() => {
    return onAuthTokensChange((tokens) => {
      if (!tokens) {
        setUser(null)
        setAccess(null)
        setRefresh(null)
        return
      }
      setAccess(tokens.access)
      setRefresh(tokens.refresh)
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginRequest(email, password)
    if (!isPlatformAdminRole(tokens.user.role)) {
      clearAuth()
      throw new ApiError(403, null, copy.adminOnly)
    }
    saveAuth(tokens)
    setUser(tokens.user)
    setAccess(tokens.access)
    setRefresh(tokens.refresh)
  }, [])

  const logout = useCallback(async () => {
    if (access && refresh) {
      try {
        await logoutRequest(access, refresh)
      } catch (err) {
        if (!(err instanceof ApiError)) throw err
      }
    }
    clearAuth()
    setUser(null)
    setAccess(null)
    setRefresh(null)
  }, [access, refresh])

  const setUserProfile = useCallback((next: AuthUser) => {
    updateStoredUser(next)
    setUser(next)
  }, [])

  const value = useMemo(
    () => ({
      user,
      access,
      isAuthenticated: Boolean(
        user && access && isPlatformAdminRole(user.role),
      ),
      isSuperAdmin: user?.role === 'SUPER_ADMIN',
      login,
      logout,
      setUser: setUserProfile,
    }),
    [user, access, login, logout, setUserProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
