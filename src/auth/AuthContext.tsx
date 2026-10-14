import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthState } from './context'
import { accounts, getSession, refreshSession, setSession, type Account } from '../services/earthApi'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthState['status']>('loading')
  const [account, setAccount] = useState<Account | null>(null)

  const load = useCallback(async () => {
    try {
      const me = await accounts.me()
      setAccount(me)
      setStatus('authenticated')
    } catch {
      setSession(null)
      setAccount(null)
      setStatus('anonymous')
    }
  }, [])

  useEffect(() => {
    let live = true
    ;(async () => {
      // A stored token, or the HttpOnly refresh cookie alone, restores the session on reload.
      const s = getSession() ?? (await refreshSession())
      if (!live) return
      if (!s) {
        setStatus('anonymous')
        return
      }
      await load()
    })()
    return () => {
      live = false
    }
  }, [load])

  const signIn = useCallback(async (email: string, code: string) => {
    await accounts.login(email, code)
    const me = await accounts.me()
    setAccount(me)
    setStatus('authenticated')
    return me
  }, [])

  const signOut = useCallback(async () => {
    await accounts.logout()
    setAccount(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo<AuthState>(
    () => ({ status, account, signIn, signOut, reload: load }),
    [status, account, signIn, signOut, load],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
