import { useCallback, useState } from 'react'
import { useLazyResolveAccountQuery } from './banksApiSlice'
import { namesMatch, titleCase } from '../../lib/bankMatch'
import { toApiError } from '../../services/earthApi'

export type AccountCheck =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'matched'; accountName: string }
  | { status: 'mismatch'; accountName: string }
  | { status: 'unavailable' }
  | { status: 'failed'; message: string }

interface CheckInput {
  country: string
  bankName: string
  bankCode?: string
  accountNumber: string
  /** The seller's name as they signed up; the account must be in it. */
  holderName: string
}

/**
 * Asks the API (Paystack behind it) for the name on a bank account and whether it is the
 * signed-in seller's. The API's own verdict (`matchesIdentity`) decides; the local name
 * comparison only stands in if an older API answers without one. `unavailable` means the lookup
 * could not be reached (404, 501 or 503); the seller is told to try again, never to type the name.
 */
export function useAccountCheck() {
  const [resolve] = useLazyResolveAccountQuery()
  const [check, setCheck] = useState<AccountCheck>({ status: 'idle' })
  const reset = useCallback(() => setCheck({ status: 'idle' }), [])
  const run = useCallback(
    async ({ country, bankName, bankCode, accountNumber, holderName }: CheckInput) => {
      setCheck({ status: 'checking' })
      try {
        const { accountName, matchesIdentity } = await resolve({ country, bankName, bankCode, accountNumber }).unwrap()
        const matched = typeof matchesIdentity === 'boolean' ? matchesIdentity : namesMatch(accountName, holderName)
        const next: AccountCheck = matched
          ? { status: 'matched', accountName: titleCase(accountName) }
          : { status: 'mismatch', accountName: titleCase(accountName) }
        setCheck(next)
        return next
      } catch (e) {
        const err = toApiError(e)
        const next: AccountCheck =
          err.status === 404 || err.status === 501 || err.status === 503
            ? { status: 'unavailable' }
            : { status: 'failed', message: err.status === 422 || err.status === 400 ? 'The bank could not find an account with that number.' : err.message }
        setCheck(next)
        return next
      }
    },
    [resolve],
  )
  return { check, run, reset }
}
