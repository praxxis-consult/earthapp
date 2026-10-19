import { useState } from 'react'
import { useGetPaymentRecipientQuery, useProvisionPaymentRecipientMutation } from '../../feature/stores/storesApiSlice'
import type { Onboarding } from '../../services/earthApi'
import { describeError } from '../../services/earthApi'
import { jakarta } from '../../utils/styles'

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

/**
 * Whether the store's share can be paid out: a Paystack recipient is provisioned from the
 * checked bank once the store is live (`/stores/{id}/payment-recipient`), and every buyer
 * payment is then split at source. Shown on the payout page and the payout settings; a live
 * store without one can set it up here.
 */
export default function RecipientStatus({ store }: { store: Onboarding | null }) {
  const live = store?.status === 'LIVE'
  const recipient = useGetPaymentRecipientQuery(store?.id ?? '', { skip: !store || !live })
  const [provision, { isLoading: busy }] = useProvisionPaymentRecipientMutation()
  const [error, setError] = useState('')

  if (!store) return null
  async function setUp() {
    setError('')
    try {
      await provision(store!.id).unwrap()
    } catch (e) {
      setError(describeError(e))
    }
  }

  const status = str(recipient.data?.status).toLowerCase().replace(/_/g, ' ')
  const text = !live
    ? 'Payouts start once your store is live with a checked bank account.'
    : recipient.isLoading
      ? 'Checking your payout setup…'
      : recipient.error
        ? describeError(recipient.error)
        : recipient.data
          ? `Payouts are set up with Paystack${status ? ` (${status})` : ''}: your share of each order is split to your bank at payment.`
          : 'Payouts are not set up yet. Set them up so your share of each order reaches your bank.'
  return (
    <div className="flex items-center justify-between gap-[16px] max-md:flex-col max-md:items-start">
      <p className={`text-[12px] leading-[20px] ${recipient.data || !live ? 'text-[#807e7e]' : 'text-[#a66608]'}`} style={jakarta(400)}>
        {error || text}
      </p>
      {live && !recipient.isLoading && !recipient.data && !recipient.error && (
        <button type="button" onClick={setUp} disabled={busy} className="shrink-0 rounded-[30px] bg-[#f2f8f6] px-[16px] py-[10px] text-[#007c53] text-[12px] leading-[15px] disabled:opacity-60" style={jakarta(600)}>
          {busy ? 'Setting up…' : 'Set up payouts'}
        </button>
      )}
    </div>
  )
}
