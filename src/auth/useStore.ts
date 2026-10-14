import { useContext } from 'react'
import { StoreContext } from './store-context'

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore needs a StoreProvider (DashboardLayout renders one)')
  return ctx
}
