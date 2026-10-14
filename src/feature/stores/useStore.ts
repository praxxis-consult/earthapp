import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectAuthStatus } from '../authentication/authSlice'
import { storesApiSlice, useGetOnboardingQuery } from './storesApiSlice'
import type { Onboarding } from '../../services/earthApi'

/** The signed-in seller's store, cached once for the whole app. */
export function useStore() {
  const status = useAppSelector(selectAuthStatus)
  const dispatch = useAppDispatch()
  const query = useGetOnboardingQuery(undefined, { skip: status !== 'authenticated' })

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
    loading: status === 'loading' || (status === 'authenticated' && query.isLoading),
    setStore,
    refresh,
  }
}
