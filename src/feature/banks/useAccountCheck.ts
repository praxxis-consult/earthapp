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
 * What a failed lookup means to the seller. `unavailable` is the API's own trouble (no lookup
 * for the country, the provider down, or the route rate-limited): try again, never type the name.
 * 400 and 422 are the provider saying no such account.
 */
export function checkFailure(err: { status?: number; message: string }): Exclude<AccountCheck, { status: 'idle' | 'checking' | 'matched' }> {
  if (err.status === 404 || err.status === 429 || err.status === 501 || err.status === 503) return { status: 'unavailable' }
  if (err.status === 422 || err.status === 400) return { status: 'failed', message: 'The bank could not find an account with that number.' }
  return { status: 'failed', message: err.message }
}

/**
 * Asks the API for the name on a bank account; it checks with Moniepoint for Nigeria and
 * Paystack for Ghana. The name is shown as the bank holds it and saved as is; the product
 * decision (17 Oct) is that the account need not be in the seller's own name.
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
        const next = checkFailure(toApiError(e))
        setCheck(next)
        return next
      }
    },
    [resolve],
  )
  return { check, run, reset }
}
