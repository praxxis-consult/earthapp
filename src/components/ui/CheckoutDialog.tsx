import { useEffect, useState, type FormEvent } from 'react'
import { Field, Select, Shell, inputClass } from './SettingsDialogs'
import { useAuth } from '../../feature/authentication/useAuth'
import { useRequestQuotesMutation, type DeliveryAddress, type Quote } from '../../feature/delivery/deliveryApiSlice'
import { useCreateOrderMutation } from '../../feature/orders/ordersApiSlice'
import { usePayment } from '../../feature/orders/usePayment'
import { regionsOf } from '../../data/locations'
import { areaProblem, earliestPickupDay, fullNameProblem, lagosDay, lagosHour, latestPickupDay, nigerianPhone, phoneProblem, postalCodeProblem, streetProblem, CARRIER_CUTOFF_HOUR } from '../../lib/address'
import { quoteRefusal, quoteView, secondsLeft } from '../../data/quotes'
import { mmss } from '../../data/orderFlow'
import type { Listing } from '../../lib/catalog'
import { naira } from '../../lib/productView'
import { describeError, toApiError } from '../../services/earthApi'
import { jakarta } from '../../utils/styles'

/** One listing and how many of it. */
export interface CheckoutLine {
  listing: Listing
  quantity: number
}
interface CheckoutDialogProps {
  /** One listing… */
  listing?: Listing
  quantity?: number
  /** …or several lines of the same store (the cart); one quote and one order hold them all. */
  lines?: CheckoutLine[]
  /** Called once the order exists (before payment starts), with its id: the cart drops the lines. */
  onOrdered?: (orderId: string) => void
  onClose: () => void
}

const tomorrow = () => lagosDay(1)

/** A page that ticks once a second, for the countdowns. */
function useNow(): number {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

/**
 * The buyer's order: where the goods go and when the carrier may collect (`POST /delivery/quotes`
 * turns that into carrier offers), the offer they choose, the note for the seller, then the order
 * (`POST /orders` from the quote id, no client key) and straight on to the hosted Paystack page.
 * A quote lasts two minutes and an order fifteen; both are counted down here. The design file has
 * no checkout frame, so this follows the 648px form dialog (639:24245).
 */
export default function CheckoutDialog({ listing, quantity, lines, onOrdered, onClose }: CheckoutDialogProps) {
  const { account } = useAuth()
  const goods: CheckoutLine[] = lines && lines.length ? lines : [{ listing: listing!, quantity: quantity ?? 1 }]
  const first = goods[0].listing
  const units = goods.reduce((n, l) => n + l.quantity, 0)
  const unitWord = (l: CheckoutLine) => `${l.quantity} ${l.listing.unit}${l.quantity === 1 ? '' : 's'}`
  /** "5 bags of Ofada Rice", or "3 listings (8 items)" for a cart. */
  const what = goods.length === 1 ? `${unitWord(goods[0])} of ${first.title}` : `${goods.length} listings (${units} items)`
  const weightKg = Math.round(goods.reduce((g, l) => g + l.quantity * l.listing.weightGrams, 0) / 1000)
  const [requestQuotes, { isLoading: busy }] = useRequestQuotesMutation()
  const [createOrder, { isLoading: placing }] = useCreateOrderMutation()
  const payment = usePayment()
  const now = useNow()
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
  // The offers, with when they arrived (their two minutes run from then), the chosen one and the note.
  const [quotes, setQuotes] = useState<{ items: Quote[]; receivedAt: number } | null>(null)
  const [chosen, setChosen] = useState('')
  const [note, setNote] = useState('')
  const set = (patch: Partial<DeliveryAddress>) => setAddress((a) => ({ ...a, ...patch }))
  const total = naira(goods.reduce((n, l) => n + l.quantity * l.listing.priceNum, 0)).replace(/\.00$/, '')
  const fieldError = (k: string) =>
    fieldErrors[k] ? (
      <p role="alert" className="text-[#b13b3b] text-[12px] leading-[20px]" style={jakarta(400)}>
        {fieldErrors[k]}
      </p>
    ) : null

  async function submit(e: FormEvent) {
    e.preventDefault()
    const a = address
    // The carrier resolves the address as typed and the API passes it through, so the carrier's rules are checked here.
    const phone = nigerianPhone(a.phone) ?? ''
    const problems: Record<string, string> = {}
    const nameIssue = fullNameProblem(a.firstName, a.lastName)
    if (nameIssue) problems[/first/.test(nameIssue) ? 'firstName' : 'lastName'] = nameIssue
    const phoneIssue = phoneProblem(a.phone)
    if (phoneIssue) problems.phone = phoneIssue
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(a.email.trim())) problems.email = 'Enter an email for the delivery updates.'
    if (!a.region) problems.region = 'Choose the state the goods go to.'
    const areaIssue = areaProblem(a.area)
    if (areaIssue) problems.area = areaIssue
    const streetIssue = streetProblem(a.street)
    if (streetIssue) problems.street = streetIssue
    const postalIssue = postalCodeProblem(a.postalCode)
    if (postalIssue) problems.postalCode = postalIssue
    if (!pickupDate || pickupDate < earliestPickupDay() || pickupDate > latestPickupDay())
      problems.pickupDate = lagosHour() >= CARRIER_CUTOFF_HOUR ? 'Carriers take requests until 6 PM Lagos time, so the earliest pickup is tomorrow; pick a day up to a week ahead.' : 'Pick a day from today to a week ahead.'
    setFieldErrors(problems)
    if (Object.keys(problems).length) return setError('Check the highlighted details.')
    setError('')
    try {
      const res = await requestQuotes({
        storeId: first.store.id,
        items: goods.map((l) => ({ productId: l.listing.id, quantity: l.quantity })),
        address: { ...a, area: a.area.trim(), street: a.street.trim(), landmark: a.landmark.trim() || 'Not provided', postalCode: a.postalCode.trim(), firstName: a.firstName.trim(), lastName: a.lastName.trim(), phone, email: a.email.trim() },
        pickupDate,
      }).unwrap()
      const items = Array.isArray(res.items) ? res.items : []
      if (!items.length) return setError('No carrier can deliver this order to that address right now. Try another address or day.')
      setQuotes({ items, receivedAt: Date.now() })
      setChosen(items[0].id)
    } catch (err) {
      const problem = toApiError(err)
      if (problem.status === 400 && problem.errors.length) {
        // `address.postalCode` → the postal code field; anything outside the address goes on the line below.
        const fe: Record<string, string> = {}
        for (const e of problem.errors) fe[(e.path ?? '').replace(/^address\./, '')] = e.code === 'invalid_format' ? 'Not in the form the carriers accept.' : `Check this (${e.code ?? 'invalid'}).`
        setFieldErrors(fe)
        return setError('The carriers could not accept some of these details. Check the highlighted fields.')
      }
      if (problem.status === 422) {
        // The carrier refused an address: `pickup` is the seller's, `address` the buyer's.
        const refusal = quoteRefusal(problem.errors)
        setFieldErrors(refusal.fields)
        return setError(refusal.message)
      }
      // The API's own words, with what a buyer can do about the ones that are the seller's to fix.
      setError(
        problem.status === 404
          ? 'This seller has not set up delivery yet, so no carrier can quote the order. Message them to arrange it.'
          : problem.status === 503
            ? 'The carriers are not answering right now. Try again in a moment.'
            : problem.status === 409 && problem.code === 'shipping-conflict'
              ? // The seller's delivery setup does not cover this basket: too heavy for their package, their own goods, or a pickup that does not match. The weight one is the buyer's to change.
                /parcel|capacity|weight|heav/i.test(problem.detail + problem.title)
                ? `${what}${weightKg ? ` (about ${weightKg} kg)` : ''} is more than this seller’s packaging takes in one order. Order fewer, or message the seller about a larger one.`
                : `${problem.detail || problem.title} Message the seller to sort it out.`
              : describeError(err),
      )
    }
  }

  async function place(e: FormEvent) {
    e.preventDefault()
    if (!quotes || !chosen) return
    setError('')
    try {
      const order = await createOrder({ quoteId: chosen, ...(note.trim() ? { note: note.trim() } : {}) }).unwrap()
      onOrdered?.(order.id)
      await payment.pay(order.id)
    } catch (err) {
      const problem = toApiError(err)
      if (problem.status === 409 || problem.status === 404) {
        // The offer ran out (or the basket changed underneath it): fresh quotes are the only way on.
        setQuotes(null)
        return setError('That offer has expired. Get fresh quotes and choose again.')
      }
      setError(problem.status === 422 ? `${problem.detail || problem.title} Message the seller to sort it out.` : describeError(err))
    }
  }

  if (payment.state.phase === 'preparing' || payment.state.phase === 'redirecting')
    return (
      <Shell title="Taking you to payment" onClose={onClose} onSubmit={(e) => e.preventDefault()} busy cta="" busyLabel="Preparing your payment…">
        <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(400)}>
          Your order is placed. Paystack’s secure page opens next; you have fifteen minutes to pay, and the seller is told once the payment is confirmed.
        </p>
      </Shell>
    )

  if (payment.state.phase === 'error')
    return (
      <Shell title="Payment did not start" onClose={onClose} onSubmit={(e) => { e.preventDefault(); payment.reset() }} busy={false} cta="Try again" cancel>
        <p role="alert" className="text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
          {payment.state.message}
        </p>
        <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
          The order is kept under My orders, where you can also pay for it.
        </p>
      </Shell>
    )

  if (quotes) {
    const views = quotes.items.map(quoteView)
    const picked = views.find((v) => v.id === chosen)
    const left = Math.min(...views.map((v) => secondsLeft(v, quotes.receivedAt, now)))
    const expired = left <= 0
    return (
      <Shell title="Choose a carrier" onClose={onClose} onSubmit={expired ? submit : place} busy={placing} cta={expired ? 'Get fresh quotes' : 'Place order and pay'} busyLabel="Placing your order…" cancel>
        <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
          {what} · {total} for the goods. Pick who delivers it; the price and total are per offer. {expired ? 'These offers have expired.' : `Offers expire in ${mmss(left)}.`}
        </p>
        <div role="radiogroup" aria-label="Carrier offers" className="flex flex-col gap-[8px]">
          {views.map((v) => {
            const active = v.id === chosen
            return (
              <label key={v.id} className={`flex items-center gap-[12px] rounded-[16px] border px-[16px] py-[12px] cursor-pointer ${active ? 'border-[#007c53] bg-[#f2f8f6]' : 'border-[#e4dede]'}`}>
                <input type="radio" name="quote" value={v.id} checked={active} onChange={() => setChosen(v.id)} disabled={expired} className="accent-[#007c53]" />
                <span className="flex flex-col gap-[2px] min-w-0 flex-1">
                  <span className="text-[#101604] text-[14px] leading-[20px] truncate" style={jakarta(600)}>
                    {v.name}
                  </span>
                  <span className="text-[#807e7e] text-[12px] leading-[16px]" style={jakarta(400)}>
                    {v.eta ? `Delivers ${v.eta.replace(/^within\s+/i, 'within ')}` : 'Delivery time not given'}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-[2px] shrink-0">
                  <span className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>
                    {v.delivery ? `${v.delivery} delivery` : 'Priced at payment'}
                  </span>
                  {v.total && (
                    <span className="text-[#807e7e] text-[12px] leading-[16px]" style={jakarta(400)}>
                      {v.total} in all
                    </span>
                  )}
                </span>
              </label>
            )
          })}
        </div>
        {picked && (picked.total || picked.goods) && (
          /* The chosen offer's breakdown, on the payment-summary lines the order pages use */
          <div className="flex flex-col gap-[8px] rounded-[16px] bg-[#f7f7f7] px-[16px] py-[12px]">
            {[
              ['Goods', picked.goods || total],
              ['Delivery', picked.delivery || 'Priced at payment'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-[#807e7e] text-[13px] leading-[16px]" style={jakarta(400)}>
                  {k}
                </span>
                <span className="text-[#101604] text-[13px] leading-[16px]" style={jakarta(500)}>
                  {v}
                </span>
              </div>
            ))}
            <div className="h-px w-full bg-[#e4dede]" />
            <div className="flex items-center justify-between">
              <span className="text-[#807e7e] text-[13px] leading-[16px]" style={jakarta(400)}>
                Total to pay
              </span>
              <span className="text-[#101604] text-[16px] leading-[20px]" style={jakarta(700)}>
                {picked.total || 'Shown at payment'}
              </span>
            </div>
            {picked.acceptMinutes !== null && (
              <p className="text-[#807e7e] text-[12px] leading-[16px]" style={jakarta(400)}>
                Once you pay, the seller has {picked.acceptMinutes} minutes to accept the order.
              </p>
            )}
          </div>
        )}
        <Field label="Note for the seller" htmlFor="co-note" hint="Optional">
          <textarea id="co-note" value={note} maxLength={500} rows={2} onChange={(e) => setNote(e.target.value)} className={`${inputClass} h-auto rounded-[20px] py-[12px]`} style={jakarta(400)} />
        </Field>
        {error && (
          <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
            {error}
          </p>
        )}
      </Shell>
    )
  }

  return (
    <Shell title="Where should it go?" onClose={onClose} onSubmit={submit} busy={busy} cta="Get delivery quotes" cancel>
      <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
        {what} from {first.store.storeName} · {total} for the goods. Carriers quote the delivery next; you pay only after choosing one.
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
          <input id="co-phone" type="tel" value={address.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="0803 123 4567" className={inputClass} style={jakarta(400)} />
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
          <input id="co-area" value={address.area} maxLength={120} onChange={(e) => set({ area: e.target.value })} placeholder="Lekki Phase 1" className={inputClass} style={jakarta(400)} />
          {fieldError('area')}
        </Field>
      </div>
      <Field label="Street address" htmlFor="co-street" hint="House or plot number and the road, or a well-known building">
        <input id="co-street" value={address.street} maxLength={240} onChange={(e) => set({ street: e.target.value })} placeholder="12 Admiralty Way" className={inputClass} style={jakarta(400)} />
          {fieldError('street')}
      </Field>
      <div className="flex gap-[16px] max-md:flex-col">
        <Field label="Landmark" htmlFor="co-landmark" hint="Optional">
          <input id="co-landmark" value={address.landmark} maxLength={240} onChange={(e) => set({ landmark: e.target.value })} className={inputClass} style={jakarta(400)} />
        </Field>
        <Field label="Postal code" htmlFor="co-postal">
          <input id="co-postal" value={address.postalCode} maxLength={6} inputMode="numeric" onChange={(e) => set({ postalCode: e.target.value.replace(/\D/g, '') })} placeholder="106104" className={inputClass} style={jakarta(400)} />
          {fieldError('postalCode')}
        </Field>
      </div>
      <Field label="Earliest pickup day" htmlFor="co-pickup" hint="When the carrier may collect from the seller: up to a week ahead, from today before 6 PM Lagos time, else from tomorrow">
        <input id="co-pickup" type="date" value={pickupDate} min={earliestPickupDay()} max={latestPickupDay()} onChange={(e) => setPickupDate(e.target.value)} className={inputClass} style={jakarta(400)} />
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
