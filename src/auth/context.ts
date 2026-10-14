import { createContext } from 'react'
import type { Account } from '../services/earthApi'

/**
 * Who is signed in. `loading` until the stored access token (or the refresh cookie) has been
 * checked against /v1/accounts/me, so guarded routes never flash the wrong state.
 */
export interface AuthState {
  status: 'loading' | 'anonymous' | 'authenticated'
  account: Account | null
  /** After a LOGIN code is verified: store the session and load the account. */
  signIn: (email: string, code: string) => Promise<Account>
  signOut: () => Promise<void>
  /** Re-read the account (after a profile change). */
  reload: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
