import { useCallback } from 'react'
import { useAppSelector } from '../../app/hooks'
import { toApiError } from '../../app/api/problem'
import { selectAuth } from './authSlice'
import { useLazyGetMeQuery, useLoginMutation, useLogoutMutation } from './authApiSlice'

/** Who is signed in, plus sign-in and sign-out over the auth slice and the auth endpoints. */
export function useAuth() {
  const { status, account } = useAppSelector(selectAuth)
  const [login] = useLoginMutation()
  const [logout] = useLogoutMutation()
  const [getMe] = useLazyGetMeQuery()

  /** After a LOGIN code is verified: store the credentials and load the account. */
  const signIn = useCallback(
    async (email: string, code: string) => {
      try {
        await login({ email, code }).unwrap()
        return await getMe(undefined, false).unwrap()
      } catch (e) {
        throw toApiError(e)
      }
    },
    [login, getMe],
  )

  const signOut = useCallback(async () => {
    await logout()
      .unwrap()
      .catch(() => {
        /* the slice is cleared either way */
      })
  }, [logout])

  /** Re-read the account (after a profile change). */
  const reload = useCallback(async () => {
    await getMe(undefined, false).unwrap()
  }, [getMe])

  return { status, account, signIn, signOut, reload }
}
