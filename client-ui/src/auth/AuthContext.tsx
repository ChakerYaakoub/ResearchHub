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
import {
  clearAuth,
  loadStoredAuth,
  saveAuth,
  updateStoredUser,
  type AuthUser,
} from './authStorage'
import {
  loginRequest,
  logoutRequest,
  registerRequest,
} from './authApi'
import { onAuthTokensChange } from './tokenSession'

type AuthContextValue = {
  user: AuthUser | null
  access: string | null
  isAuthenticated: boolean
  login: (email: string, password: string, company?: string) => Promise<void>
  register: (email: string, password: string, company?: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadStoredAuth()
  const [user, setUser] = useState<AuthUser | null>(initial?.user ?? null)
  const [access, setAccess] = useState<string | null>(initial?.access ?? null)
  const [refresh, setRefresh] = useState<string | null>(initial?.refresh ?? null)

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

  const login = useCallback(
    async (email: string, password: string, company = '') => {
      const tokens = await loginRequest(email, password, company)
      saveAuth(tokens)
      setUser(tokens.user)
      setAccess(tokens.access)
      setRefresh(tokens.refresh)
    },
    [],
  )

  const register = useCallback(
    async (email: string, password: string, company = '') => {
      const tokens = await registerRequest(email, password, company)
      saveAuth(tokens)
      setUser(tokens.user)
      setAccess(tokens.access)
      setRefresh(tokens.refresh)
    },
    [],
  )

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
      isAuthenticated: Boolean(user && access),
      login,
      register,
      logout,
      setUser: setUserProfile,
    }),
    [user, access, login, register, logout, setUserProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
