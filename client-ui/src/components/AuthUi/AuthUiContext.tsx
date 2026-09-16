import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type AuthModalMode = 'login' | 'register'

const OPEN_LOGIN_FLAG = 'rh_open_login'

type AuthUiValue = {
  open: boolean
  mode: AuthModalMode
  openLogin: () => void
  openRegister: () => void
  close: () => void
  switchMode: (mode: AuthModalMode) => void
}

const AuthUiContext = createContext<AuthUiValue | null>(null)

/** Flag RequireAuth sets so PublicLayout can open the login modal once. */
export function requestLoginModal() {
  sessionStorage.setItem(OPEN_LOGIN_FLAG, '1')
}

export function consumeLoginModalRequest(): boolean {
  if (sessionStorage.getItem(OPEN_LOGIN_FLAG) !== '1') return false
  sessionStorage.removeItem(OPEN_LOGIN_FLAG)
  return true
}

export function AuthUiProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<AuthModalMode>('login')

  const openLogin = useCallback(() => {
    setMode('login')
    setOpen(true)
  }, [])

  const openRegister = useCallback(() => {
    setMode('register')
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  const switchMode = useCallback((next: AuthModalMode) => {
    setMode(next)
  }, [])

  const value = useMemo(
    () => ({ open, mode, openLogin, openRegister, close, switchMode }),
    [open, mode, openLogin, openRegister, close, switchMode],
  )

  return (
    <AuthUiContext.Provider value={value}>{children}</AuthUiContext.Provider>
  )
}

export function useAuthUi() {
  const ctx = useContext(AuthUiContext)
  if (!ctx) {
    throw new Error('useAuthUi must be used within AuthUiProvider')
  }
  return ctx
}
