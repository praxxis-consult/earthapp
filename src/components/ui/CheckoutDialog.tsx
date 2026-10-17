import { useState, type FormEvent } from 'react'
import { Field, Select, Shell, inputClass } from './SettingsDialogs'
import { useAuth } from '../../feature/authentication/useAuth'
import { useRequestQuotesMutation, type DeliveryAddress } from '../../feature/delivery/deliveryApiSlice'
import { regionsOf } from '../../data/locations'
import type { Listing } from '../../lib/catalog'
import { naira } from '../../lib/productView'
import { describeError, toApiError } from '../../services/earthApi'
import { jakarta } from '../../utils/styles'

interface CheckoutDialogProps {
  listing: Listing
  quantity: number
  onClose: () => void
}

/** Tomorrow, as the date input wants it; carriers collect from the next day. */
function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

/**
 * The buyer's order, step one: where the goods go and when the carrier may collect, which the
 * API turns into carrier quotes (`POST /delivery/quotes`). The design file has no checkout frame,
 * so this follows the 648px form dialog (639:24245). Choosing a quote and paying follow once the
 * API documents what a quote and an order look like; today the QA server's carriers do not answer.
 */
export default function CheckoutDialog({ listing, quantity, onClose }: CheckoutDialogProps) {
  const { account } = useAuth()
  const [requestQuotes, { isLoading: busy }] = useRequestQuotesMutation()
  const [address, setAddress] = useState<DeliveryAddress>({
    country: 'NG',
    region: '',
    area: '',
    street: '',
    landmark: '',
    postalCode: '',
    firstName: account?.firstName ?? '',
    lastName: account?.lastName ?? '',
    phone: account?.phoneNumber ?? '',
    email: account?.email ?? '',
  })
  const [pickupDate, setPickupDate] = useState(tomorrow)
  const [error, setError] = useState('')
  const [quoted, setQuoted] = useState(false)
  const set = (patch: Partial<DeliveryAddress>) => setAddress((a) => ({ ...a, ...patch }))
  const total = naira(quantity * listing.priceNum).replace(/\.00$/, '')

  async function submit(e: FormEvent) {
    e.preventDefault()
    const a = address
    if (!a.region) return setError('Choose the state the goods go to.')
    if (!a.area.trim() || !a.street.trim()) return setError('Enter the area and the street address.')
    if (!a.postalCode.trim()) return setError('Enter the postal code.')
    if (!a.firstName.trim() || !a.lastName.trim()) return setError('Enter the name of who receives the goods.')
    if (!/^\+?\d{7,15}$/.test(a.phone.replace(/[\s-]/g, ''))) return setError('Enter a phone number the carrier can call.')
    if (!a.email.trim()) return setError('Enter an email for the delivery updates.')
    setError('')
    try {
      await requestQuotes({
        storeId: listing.store.id,
        items: [{ productId: listing.id, quantity }],
        address: { ...a, area: a.area.trim(), street: a.street.trim(), landmark: a.landmark.trim() || 'Not provided', postalCode: a.postalCode.trim(), firstName: a.firstName.trim(), lastName: a.lastName.trim(), phone: a.phone.replace(/[\s-]/g, ''), email: a.email.trim() },
        pickupDate,
      }).unwrap()
      setQuoted(true)
    } catch (err) {
      const problem = toApiError(err)
      // The API's own words, with what a buyer can do about the ones that are the seller's to fix.
      setError(
        problem.status === 404
          ? 'This seller has not set up delivery yet, so no carrier can quote the order. Message them to arrange it.'
          : problem.status === 503
            ? 'The carriers are not answering right now. Try again in a moment.'
            : describeError(err),
      )
    }
  }

  if (quoted)
    return (
      <Shell title="Delivery quotes" onClose={onClose} onSubmit={(e) => { e.preventDefault(); onClose() }} busy={false} cta="Close">
        <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(400)}>
          The carriers have quoted this delivery. Choosing a carrier and paying is the next step; it opens here as soon as the API describes the quotes it returns.
        </p>
      </Shell>
    )

  return (
    <Shell title="Where should it go?" onClose={onClose} onSubmit={submit} busy={busy} cta="Get delivery quotes" cancel>
      <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
        {quantity} {listing.unit}{quantity === 1 ? '' : 's'} of {listing.title} from {listing.store.storeName} · {total} for the goods. Carriers quote the delivery next; you pay only after choosing one.
      </p>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="First name" htmlFor="co-first">
          <input id="co-first" value={address.firstName} maxLength={80} onChange={(e) => set({ firstName: e.target.value })} className={inputClass} style={jakarta(400)} />
        </Field>
        <Field label="Last name" htmlFor="co-last">
          <input id="co-last" value={address.lastName} maxLength={80} onChange={(e) => set({ lastName: e.target.value })} className={inputClass} style={jakarta(400)} />
        </Field>
      </div>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="Phone" htmlFor="co-phone">
          <input id="co-phone" type="tel" value={address.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+234…" className={inputClass} style={jakarta(400)} />
        </Field>
        <Field label="Email" htmlFor="co-email">
          <input id="co-email" type="email" value={address.email} maxLength={254} onChange={(e) => set({ email: e.target.value })} className={inputClass} style={jakarta(400)} />
        </Field>
      </div>
      {/* The API delivers within Nigeria only today, so the country is not a choice. */}
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="State" htmlFor="co-region">
          <Select id="co-region" value={address.region} options={regionsOf('NG')} onChange={(v) => set({ region: v })} placeholder="Select state" />
        </Field>
        <Field label="Area" htmlFor="co-area">
          <input id="co-area" value={address.area} maxLength={120} onChange={(e) => set({ area: e.target.value })} placeholder="Town or district" className={inputClass} style={jakarta(400)} />
        </Field>
      </div>
      <Field label="Street address" htmlFor="co-street">
        <input id="co-street" value={address.street} maxLength={240} onChange={(e) => set({ street: e.target.value })} className={inputClass} style={jakarta(400)} />
      </Field>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="Landmark" htmlFor="co-landmark" hint="Optional">
          <input id="co-landmark" value={address.landmark} maxLength={240} onChange={(e) => set({ landmark: e.target.value })} className={inputClass} style={jakarta(400)} />
        </Field>
        <Field label="Postal code" htmlFor="co-postal">
          <input id="co-postal" value={address.postalCode} maxLength={12} onChange={(e) => set({ postalCode: e.target.value })} className={inputClass} style={jakarta(400)} />
        </Field>
      </div>
      <Field label="Earliest pickup day" htmlFor="co-pickup" hint="When the carrier may collect from the seller">
        <input id="co-pickup" type="date" value={pickupDate} min={tomorrow()} onChange={(e) => setPickupDate(e.target.value)} className={inputClass} style={jakarta(400)} />
      </Field>
      {error && (
        <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
          {error}
        </p>
      )}
    </Shell>
  )
}
