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
  // One line under a field, from the checks here or from the API's `errors[].path` (`address.postalCode`).
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [quoted, setQuoted] = useState(false)
  const set = (patch: Partial<DeliveryAddress>) => setAddress((a) => ({ ...a, ...patch }))
  const total = naira(quantity * listing.priceNum).replace(/\.00$/, '')
  const fieldError = (k: string) =>
    fieldErrors[k] ? (
      <p role="alert" className="text-[#b13b3b] text-[12px] leading-[20px]" style={jakarta(400)}>
        {fieldErrors[k]}
      </p>
    ) : null

  async function submit(e: FormEvent) {
    e.preventDefault()
    const a = address
    const phone = a.phone.replace(/[\s-]/g, '')
    // The API's own rules (its OpenAPI patterns), checked here so the buyer hears them before the round trip.
    const problems: Record<string, string> = {}
    if (!a.firstName.trim()) problems.firstName = 'Enter the first name of who receives the goods.'
    if (!a.lastName.trim()) problems.lastName = 'Enter the last name.'
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) problems.phone = 'Enter the number with its country code, like +2348012345678.'
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(a.email.trim())) problems.email = 'Enter an email for the delivery updates.'
    if (!a.region) problems.region = 'Choose the state the goods go to.'
    if (!a.area.trim()) problems.area = 'Enter the town or district.'
    if (!a.street.trim()) problems.street = 'Enter the street address.'
    if (!/^\d{6}$/.test(a.postalCode.trim())) problems.postalCode = 'Nigerian postal codes are six digits, like 100001.'
    if (!pickupDate || new Date(pickupDate) < new Date(tomorrow())) problems.pickupDate = 'Pick a day from tomorrow on.'
    setFieldErrors(problems)
    if (Object.keys(problems).length) return setError('Check the highlighted details.')
    setError('')
    try {
      await requestQuotes({
        storeId: listing.store.id,
        items: [{ productId: listing.id, quantity }],
        address: { ...a, area: a.area.trim(), street: a.street.trim(), landmark: a.landmark.trim() || 'Not provided', postalCode: a.postalCode.trim(), firstName: a.firstName.trim(), lastName: a.lastName.trim(), phone, email: a.email.trim() },
        pickupDate,
      }).unwrap()
      setQuoted(true)
    } catch (err) {
      const problem = toApiError(err)
      if (problem.status === 400 && problem.errors.length) {
        // `address.postalCode` → the postal code field; anything outside the address goes on the line below.
        const fe: Record<string, string> = {}
        for (const e of problem.errors) fe[(e.path ?? '').replace(/^address\./, '')] = e.code === 'invalid_format' ? 'Not in the form the carriers accept.' : `Check this (${e.code ?? 'invalid'}).`
        setFieldErrors(fe)
        return setError('The carriers could not accept some of these details. Check the highlighted fields.')
      }
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
          {fieldError('firstName')}
        </Field>
        <Field label="Last name" htmlFor="co-last">
          <input id="co-last" value={address.lastName} maxLength={80} onChange={(e) => set({ lastName: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('lastName')}
        </Field>
      </div>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="Phone" htmlFor="co-phone">
          <input id="co-phone" type="tel" value={address.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+234…" className={inputClass} style={jakarta(400)} />
          {fieldError('phone')}
        </Field>
        <Field label="Email" htmlFor="co-email">
          <input id="co-email" type="email" value={address.email} maxLength={254} onChange={(e) => set({ email: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('email')}
        </Field>
      </div>
      {/* The API delivers within Nigeria only today, so the country is not a choice. */}
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="State" htmlFor="co-region">
          <Select id="co-region" value={address.region} options={regionsOf('NG')} onChange={(v) => set({ region: v })} placeholder="Select state" />
          {fieldError('region')}
        </Field>
        <Field label="Area" htmlFor="co-area">
          <input id="co-area" value={address.area} maxLength={120} onChange={(e) => set({ area: e.target.value })} placeholder="Town or district" className={inputClass} style={jakarta(400)} />
          {fieldError('area')}
        </Field>
      </div>
      <Field label="Street address" htmlFor="co-street">
        <input id="co-street" value={address.street} maxLength={240} onChange={(e) => set({ street: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('street')}
      </Field>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="Landmark" htmlFor="co-landmark" hint="Optional">
          <input id="co-landmark" value={address.landmark} maxLength={240} onChange={(e) => set({ landmark: e.target.value })} className={inputClass} style={jakarta(400)} />
        </Field>
        <Field label="Postal code" htmlFor="co-postal">
          <input id="co-postal" value={address.postalCode} maxLength={12} onChange={(e) => set({ postalCode: e.target.value })} className={inputClass} style={jakarta(400)} />
          {fieldError('postalCode')}
        </Field>
      </div>
      <Field label="Earliest pickup day" htmlFor="co-pickup" hint="When the carrier may collect from the seller">
        <input id="co-pickup" type="date" value={pickupDate} min={tomorrow()} onChange={(e) => setPickupDate(e.target.value)} className={inputClass} style={jakarta(400)} />
          {fieldError('pickupDate')}
      </Field>
      {error && (
        <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
          {error}
        </p>
      )}
    </Shell>
  )
}
