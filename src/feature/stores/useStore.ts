import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectAccount, selectAuthStatus } from '../authentication/authSlice'
import { canSell } from '../authentication/role'
import { storesApiSlice, useGetOnboardingQuery } from './storesApiSlice'
import type { Onboarding } from '../../services/earthApi'

/** The signed-in seller's store, cached once for the whole app. */
export function useStore() {
  const status = useAppSelector(selectAuthStatus)
  const account = useAppSelector(selectAccount)
  const dispatch = useAppDispatch()
  // A buying account has no store and the API refuses the call (403), so it is never made.
  const seller = status === 'authenticated' && canSell(account)
  const query = useGetOnboardingQuery(undefined, { skip: !seller })

  /** Replace the cached store after a save, so the sidebar and settings agree. */
  const setStore = useCallback(
    (store: Onboarding | null) => {
      dispatch(storesApiSlice.util.upsertQueryData('getOnboarding', undefined, store))
    },
    [dispatch],
  )

  const refresh = useCallback(async () => {
    await query.refetch()
  }, [query])

  return {
    store: query.data ?? null,
    loading: status === 'loading' || (seller && query.isLoading),
    setStore,
    refresh,
  }
}
