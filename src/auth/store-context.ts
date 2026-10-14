import { createContext } from 'react'
import type { Onboarding } from '../services/earthApi'

export interface StoreState {
  /** null until loaded, and when the account has no store yet. */
  store: Onboarding | null
  loading: boolean
  /** Replace the cached store after a save, so the sidebar and settings agree. */
  setStore: (store: Onboarding | null) => void
  refresh: () => Promise<void>
}

export const StoreContext = createContext<StoreState | null>(null)
