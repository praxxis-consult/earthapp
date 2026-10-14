import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Account } from '../../services/earthApi'

export interface Credentials {
  accessToken: string
  expiresAt: string
}

export interface AuthState {
  accessToken: string | null
  expiresAt: string | null
  account: Account | null
  /** 'loading' until the stored token (or the refresh cookie) has been checked against /accounts/me. */
  status: 'loading' | 'anonymous' | 'authenticated'
}

const SESSION_KEY = 'earth.session'

function readStored(): Credentials | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Credentials
    return s.accessToken && s.expiresAt ? s : null
  } catch {
    return null
  }
}

function persist(creds: Credentials | null) {
  try {
    if (creds) localStorage.setItem(SESSION_KEY, JSON.stringify(creds))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    /* storage blocked: the token still lives for this page */
  }
}

const stored = readStored()
const initialState: AuthState = {
  accessToken: stored?.accessToken ?? null,
  expiresAt: stored?.expiresAt ?? null,
  account: null,
  status: 'loading',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<Credentials>) {
      state.accessToken = action.payload.accessToken
      state.expiresAt = action.payload.expiresAt
      persist(action.payload)
    },
    setAccount(state, action: PayloadAction<Account>) {
      state.account = action.payload
      state.status = 'authenticated'
    },
    logOut(state) {
      state.accessToken = null
      state.expiresAt = null
      state.account = null
      state.status = 'anonymous'
      persist(null)
    },
  },
})

export const { setCredentials, setAccount, logOut } = authSlice.actions
export default authSlice.reducer

export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectAccount = (state: { auth: AuthState }) => state.auth.account
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status
