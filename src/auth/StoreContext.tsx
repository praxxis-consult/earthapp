import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { stores, type Onboarding } from '../services/earthApi'
import { StoreContext } from './store-context'
import { useAuth } from './useAuth'

/** Loads the signed-in seller's store once for the whole dashboard. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const [store, setStore] = useState<Onboarding | null>(null)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setStore(await stores.onboarding())
    } catch {
      setStore(null)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    let live = true
    stores
      .onboarding()
      .then((s) => live && setStore(s))
      .catch(() => live && setStore(null))
      .finally(() => live && setLoaded(true))
    return () => {
      live = false
    }
  }, [status])

  const loading = status === 'loading' || (status === 'authenticated' && !loaded)
  const value = useMemo(() => ({ store, loading, setStore, refresh }), [store, loading, refresh])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
