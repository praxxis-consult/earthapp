import { useCallback, useState } from 'react'
import { useLazyResolveAccountQuery } from './banksApiSlice'
import { titleCase } from '../../lib/bankMatch'
import { toApiError } from '../../services/earthApi'

export type AccountCheck =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'matched'; accountName: string; bankCode: string }
  | { status: 'unavailable' }
  | { status: 'failed'; message: string }

interface CheckInput {
  country: string
  bankName: string
  bankCode?: string
  accountNumber: string
}

/**
 * Asks the API (Paystack behind it) for the name on a bank account. The name is shown as the
 * bank holds it and saved as is; the product decision (17 Oct) is that the account need not be
 * in the seller's own name. `unavailable` means the lookup could not be reached (404, 501 or
 * 503); the seller is told to try again, never to type the name.
 */
export function useAccountCheck() {
  const [resolve] = useLazyResolveAccountQuery()
  const [check, setCheck] = useState<AccountCheck>({ status: 'idle' })
  const reset = useCallback(() => setCheck({ status: 'idle' }), [])
  const run = useCallback(
    async ({ country, bankName, bankCode, accountNumber }: CheckInput) => {
      setCheck({ status: 'checking' })
      try {
        const r = await resolve({ country, bankName, bankCode, accountNumber }).unwrap()
        const next: AccountCheck = { status: 'matched', accountName: titleCase(r.accountName), bankCode: r.bankCode || bankCode || '' }
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
