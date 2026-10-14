import { useEffect, type ReactNode } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { store } from '../../app/store'
import { authApiSlice } from './authApiSlice'
import { logOut } from './authSlice'

/**
 * Restores the session on load: a stored access token, or the HttpOnly refresh cookie alone,
 * is enough to read /accounts/me. Anything else leaves the visitor anonymous.
 */
export default function SessionBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        if (!store.getState().auth.accessToken) await dispatch(authApiSlice.endpoints.refresh.initiate()).unwrap()
        const me = dispatch(authApiSlice.endpoints.getMe.initiate(undefined, { forceRefetch: true }))
        try {
          await me.unwrap()
        } finally {
          me.unsubscribe()
        }
      } catch {
        if (live) dispatch(logOut())
      }
    })()
    return () => {
      live = false
    }
  }, [dispatch])
  return children
}
