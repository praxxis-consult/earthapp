import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Field, Shell, inputClass } from './SettingsDialogs'
import AddressStep from './AddressStep'
import OptionRow from './OptionRow'
import pickupIcon from '../../assets/icons/co-pickup.svg'
import truckIcon from '../../assets/icons/od-truck-fast.svg'
import type { CheckoutLine } from './CheckoutDialog'
import { useAuth } from '../../feature/authentication/useAuth'
import { NEW_ADDRESS, resolveAddress, useAddresses } from '../../lib/addresses'
import { signupAddress } from '../../lib/signupAddress'
import { useRequestQuotesMutation, type DeliveryAddress, type Quote } from '../../feature/delivery/deliveryApiSlice'
import { useCheckout } from '../../feature/checkout/useCheckout'
import type { CheckoutStore } from '../../feature/checkout/checkoutApiSlice'
import { addressProblems, carrierAddress, lagosDay } from '../../lib/address'
import { capacityMessage, quoteRefusal, quoteView, secondsLeft } from '../../data/quotes'
import { mmss } from '../../data/orderFlow'
import { naira } from '../../lib/productView'
import { describeError, toApiError } from '../../services/earthApi'
import type { ProductNamer } from '../../lib/purchaseRule'
import { jakarta } from '../../utils/styles'

/** One store of the cart, with its lines resolved to listings. */
export interface CartStoreGroup {
  storeId: string
  storeName: string
  /** "Uzere, Delta": where the buyer collects when they choose to. */
  pickupPlace: string
  lines: CheckoutLine[]
}

interface CartCheckoutDialogProps {
  groups: CartStoreGroup[]
  cartVersion: number
  onClose: () => void
}

type Method = 'delivery' | 'pickup'
type Step = 'method' | 'address' | 'quotes'

const tomorrow = () => lagosDay(1)
const money = (n: number) => naira(n).replace(/\.00$/, '')
const goodsOf = (g: CartStoreGroup) => g.lines.reduce((n, l) => n + l.quantity * l.listing.priceNum, 0)

function useNow(): number {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

/**
 * The whole cart in one payment (`POST /checkouts`, 25 October). First how each store's goods
 * reach the buyer: a carrier, or the buyer collects. Then, for the stores a carrier delivers,
 * one address and pickup day, a quote per store and a carrier chosen for each. Then the checkout
 * is created with every store's choice, the worker reserves each store's order, and one Paystack
 * page pays for all of them. Quotes last two minutes, counted down here.
 */
export default function CartCheckoutDialog({ groups, cartVersion, onClose }: CartCheckoutDialogProps) {
  const { account } = useAuth()
  const { list: saved, defaultAddress } = useAddresses()
  const [pickedAddress, setPickedAddress] = useState<string | null>(null)
  const picked = pickedAddress ?? defaultAddress?.id ?? NEW_ADDRESS
  const [requestQuotes, { isLoading: quoting }] = useRequestQuotesMutation()
  // A refused checkout names the product by id; the lines here give it its title and unit.
  const nameOf: ProductNamer = (productId) => {
    const l = groups.flatMap((g) => g.lines).find((x) => x.listing.id === productId)
    return l ? { title: l.listing.title, unit: l.listing.unit } : undefined
  }
  const storeOf = (storeId: string) => groups.find((g) => g.storeId === storeId)?.storeName
  const checkout = useCheckout(nameOf, storeOf)
  const now = useNow()
  // One client id per dialog: a retry of the same checkout is the same checkout.
  const clientCheckoutId = useRef(crypto.randomUUID())
  const [step, setStep] = useState<Step>('method')
  const [methods, setMethods] = useState<Record<string, Method>>(() => Object.fromEntries(groups.map((g) => [g.storeId, 'delivery'])))
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [address, setAddress] = useState<DeliveryAddress>(() => ({ country: 'NG', region: '', area: '', ...signupAddress(account?.signupAddressDraft), postalCode: '', firstName: account?.firstName ?? '', lastName: account?.lastName ?? '', phone: account?.phoneNumber ?? '', email: account?.email ?? '' }))
  const [pickupDate, setPickupDate] = useState(tomorrow)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  // Per delivered store: its offers (and when they came), or the reason it has none.
  const [quotes, setQuotes] = useState<Record<string, { items: Quote[]; receivedAt: number; problem?: string }>>({})
  const [chosen, setChosen] = useState<Record<string, string>>({})

  const delivered = groups.filter((g) => methods[g.storeId] === 'delivery')
  const collected = groups.filter((g) => methods[g.storeId] === 'pickup')
  const goodsTotal = groups.reduce((n, g) => n + goodsOf(g), 0)

  function next(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (delivered.length === 0) return void place()
    setStep('address')
  }

  async function askCarriers(e: FormEvent) {
    e.preventDefault()
    const chosenAddress = resolveAddress(saved, picked, address)
    const problems = addressProblems(chosenAddress, pickupDate)
    setFieldErrors(problems)
    if (Object.keys(problems).length) return setError(picked === NEW_ADDRESS ? 'Check the highlighted details.' : 'That saved address is missing something the carriers need; edit it under Account settings or type one here.')
    setError('')
    const clean = carrierAddress(chosenAddress)
    const results = await Promise.all(
      delivered.map(async (g) => {
        try {
          const res = await requestQuotes({ storeId: g.storeId, items: g.lines.map((l) => ({ productId: l.listing.id, quantity: l.quantity })), address: clean, pickupDate }).unwrap()
          const items = Array.isArray(res.items) ? res.items : []
          return [g.storeId, { items, receivedAt: Date.now(), problem: items.length ? undefined : 'No carrier can deliver this store’s goods to that address right now.' }] as const
        } catch (err) {
          const problem = toApiError(err)
          if (problem.status === 400 && problem.errors.length) {
            const fe: Record<string, string> = {}
            for (const e of problem.errors) fe[(e.path ?? '').replace(/^address\./, '')] = e.code === 'invalid_format' ? 'Not in the form the carriers accept.' : `Check this (${e.code ?? 'invalid'}).`
            setFieldErrors(fe)
            return [g.storeId, { items: [], receivedAt: Date.now(), problem: 'The carriers could not accept some of the address details.' }] as const
          }
          if (problem.status === 422) {
            const refusal = quoteRefusal(problem.errors)
            setFieldErrors((f) => ({ ...f, ...refusal.fields }))
            return [g.storeId, { items: [], receivedAt: Date.now(), problem: refusal.message }] as const
          }
          const text =
            problem.status === 404
              ? 'This seller has not set up delivery yet. Collect from them instead, or message them.'
              : problem.status === 409 && capacityMessage(problem, 'cart')
                ? capacityMessage(problem, 'cart')!
                : problem.status === 409
                  ? `${problem.detail || problem.title} Message the seller to sort it out.`
                  : problem.status === 503 && problem.code === 'provider-account-unavailable'
                    ? 'Earth’s delivery provider account needs attention before carriers can quote. Collect from this seller instead, or try again later.'
                    : problem.status === 503
                    ? 'The carriers are not answering right now. Try again in a moment.'
                    : describeError(err)
          return [g.storeId, { items: [], receivedAt: Date.now(), problem: text }] as const
        }
      }),
    )
    const byStore = Object.fromEntries(results)
    setQuotes(byStore)
    setChosen(Object.fromEntries(results.filter(([, q]) => q.items.length).map(([id, q]) => [id, q.items[0].id])))
    // An address the carriers refused keeps the buyer on the form; anything else moves on to the offers.
    if (results.every(([, q]) => q.problem) && Object.keys(fieldErrors).length) return setError('The carriers could not accept the address. Check the highlighted fields.')
    setStep('quotes')
  }

  async function place(e?: FormEvent) {
    e?.preventDefault()
    setError('')
    const stores: CheckoutStore[] = groups.map((g) => {
      const note = (notes[g.storeId] ?? '').trim()
      return methods[g.storeId] === 'pickup'
        ? { storeId: g.storeId, fulfillmentMethod: 'SELF_PICKUP', ...(note ? { note } : {}) }
        : { storeId: g.storeId, fulfillmentMethod: 'SHIPPING', quoteId: chosen[g.storeId], ...(note ? { note } : {}) }
    })
    if (stores.some((s) => s.fulfillmentMethod === 'SHIPPING' && !s.quoteId)) return setError('Choose a carrier for every delivered store, or switch that store to collection.')
    await checkout.place(cartVersion, stores, clientCheckoutId.current)
  }

  if (checkout.state.phase === 'preparing' || checkout.state.phase === 'paying' || checkout.state.phase === 'redirecting')
    return (
      <Shell title="Taking you to payment" onClose={onClose} onSubmit={(e) => e.preventDefault()} busy cta="" busyLabel={checkout.state.phase === 'preparing' ? 'Reserving your goods…' : 'Preparing your payment…'}>
        <p className="text-[#101604] text-[14px] leading-[24px]" style={jakarta(400)}>
          {groups.length === 1 ? 'Your order is being placed.' : `Your ${groups.length} orders are being placed, one per store, with one payment for all of them.`} Paystack’s secure page opens next; you have fifteen minutes to pay, and each seller is told once the payment is confirmed.
        </p>
      </Shell>
    )

  if (checkout.state.phase === 'error')
    return (
      <Shell title="Checkout did not go through" onClose={onClose} onSubmit={(e) => { e.preventDefault(); checkout.reset() }} busy={false} cta="Back" cancel>
        <p role="alert" className="text-[#b13b3b] text-[14px] leading-[24px]" style={jakarta(400)}>
          {checkout.state.message}
        </p>
        <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
          Nothing was charged. Your cart is as you left it.
        </p>
      </Shell>
    )

  if (step === 'quotes') {
    const perStore = delivered.map((g) => {
      const q = quotes[g.storeId]
      const views = q ? q.items.map(quoteView) : []
      const left = views.length ? Math.min(...views.map((v) => secondsLeft(v, q!.receivedAt, now))) : 0
      return { g, q, views, left, picked: views.find((v) => v.id === chosen[g.storeId]) }
    })
    const anyExpired = perStore.some((p) => p.views.length && p.left <= 0)
    const blocked = perStore.some((p) => !p.views.length)
    const deliveryTotal = perStore.reduce((n, p) => n + (p.picked?.deliveryNum ?? 0), 0)
    return (
      <Shell
        title="Choose the carriers"
        onClose={onClose}
        onSubmit={anyExpired || blocked ? askCarriers : place}
        busy={quoting}
        cta={anyExpired || blocked ? 'Get fresh quotes' : 'Place orders and pay'}
        busyLabel="Asking the carriers…"
        cancel
      >
        <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
          {money(goodsTotal)} for the goods across {groups.length} {groups.length === 1 ? 'store' : 'stores'}. Pick who delivers each store’s goods; the prices are per offer.
        </p>
        {perStore.map(({ g, q, views, left }) => (
          <div key={g.storeId} className="flex flex-col gap-[8px]">
            <p className="text-[#101604] text-[14px] leading-[20px]" style={jakarta(600)}>
              {g.storeName} · {money(goodsOf(g))} {views.length ? (left <= 0 ? '· offers expired' : `· offers expire in ${mmss(left)}`) : ''}
            </p>
            {views.length ? (
              <div role="radiogroup" aria-label={`Carrier offers for ${g.storeName}`} className="flex flex-col gap-[8px]">
                {views.map((v) => (
                  <OptionRow key={v.id} name={`quote-${g.storeId}`} value={v.id} checked={v.id === chosen[g.storeId]} onChange={() => setChosen((c) => ({ ...c, [g.storeId]: v.id }))} disabled={left <= 0} icon={truckIcon} title={v.name} subtitle={v.eta ? `Delivers ${v.eta.replace(/^within\s+/i, 'within ')}` : 'Delivery time not given'} price={v.delivery || 'Priced at payment'} />
                ))}
                <OptionRow name={`quote-${g.storeId}`} value="pickup" checked={false} onChange={() => { setMethods((m) => ({ ...m, [g.storeId]: 'pickup' })); setQuotes((q) => { const { [g.storeId]: _gone, ...rest } = q; return rest }) }} icon={pickupIcon} title="Pickup" subtitle={`Pick your package yourself in ${g.pickupPlace}`} price="Free" />
              </div>
            ) : (
              <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
                {q?.problem ?? 'No offers.'}{' '}
                <button type="button" onClick={() => { setMethods((m) => ({ ...m, [g.storeId]: 'pickup' })); setStep('method') }} className="text-[#007c53]" style={jakarta(500)}>
                  Collect from this seller instead
                </button>
              </p>
            )}
          </div>
        ))}
        {collected.length > 0 && (
          <p className="text-[#807e7e] text-[13px] leading-[20px]" style={jakarta(400)}>
            You collect from {collected.map((g) => `${g.storeName} (${g.pickupPlace})`).join(' and ')}; no delivery charge for {collected.length === 1 ? 'that order' : 'those orders'}.
          </p>
        )}
        <div className="flex flex-col gap-[8px] rounded-[16px] bg-[#f7f7f7] px-[16px] py-[12px]">
          {[
            ['Goods', money(goodsTotal)],
            ['Delivery', perStore.length ? (perStore.every((p) => p.picked?.deliveryNum !== undefined) ? money(deliveryTotal) : 'Priced at payment') : money(0)],
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
              {perStore.every((p) => p.picked?.deliveryNum !== undefined) ? money(goodsTotal + deliveryTotal) : 'Shown at payment'}
            </span>
          </div>
          <p className="text-[#807e7e] text-[12px] leading-[16px]" style={jakarta(400)}>
            One payment; each store gets its own order and accepts it separately.
          </p>
        </div>
        {error && (
          <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
            {error}
          </p>
        )}
      </Shell>
    )
  }

  if (step === 'address')
    return (
      <Shell title="Where should it go?" onClose={onClose} onSubmit={askCarriers} busy={quoting} cta="Get delivery quotes" busyLabel="Asking the carriers…" cancel>
        <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
          One address for the {delivered.length === 1 ? 'delivered order' : `${delivered.length} delivered orders`}; each store’s carrier quotes its own delivery next, and you pay only after choosing.
        </p>
        <AddressStep saved={saved} picked={picked} onPick={setPickedAddress} address={address} onChange={(patch) => setAddress((a) => ({ ...a, ...patch }))} fieldErrors={fieldErrors} pickupDate={pickupDate} onPickupDate={setPickupDate} idPrefix="cc" />
        <button type="button" onClick={() => setStep('method')} className="text-left text-[#007c53] text-[13px] leading-[20px]" style={jakarta(500)}>
          Back to how you get each order
        </button>
        {error && (
          <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
            {error}
          </p>
        )}
      </Shell>
    )

  return (
    <Shell title="How do you want each order?" onClose={onClose} onSubmit={next} busy={false} cta={delivered.length ? 'Continue to delivery address' : 'Place orders and pay'} cancel>
      <p className="text-[#807e7e] text-[14px] leading-[24px]" style={jakarta(400)}>
        {money(goodsTotal)} for the goods. Each store is its own order; a carrier can deliver it, or you collect it from the seller. One payment covers them all.
      </p>
      {groups.map((g) => (
        <div key={g.storeId} className="flex flex-col gap-[8px] rounded-[16px] border border-[#e4dede] p-[16px]">
          <div className="flex items-center justify-between gap-[12px]">
            <p className="text-[#101604] text-[14px] leading-[20px] truncate" style={jakarta(600)}>
              {g.storeName}
            </p>
            <p className="text-[#807e7e] text-[13px] leading-[20px] shrink-0" style={jakarta(400)}>
              {g.lines.length} {g.lines.length === 1 ? 'listing' : 'listings'} · {money(goodsOf(g))}
            </p>
          </div>
          <div role="radiogroup" aria-label={`How you get the order from ${g.storeName}`} className="flex flex-col gap-[8px]">
            <OptionRow name={`method-${g.storeId}`} value="delivery" checked={methods[g.storeId] === 'delivery'} onChange={() => setMethods((m) => ({ ...m, [g.storeId]: 'delivery' }))} icon={truckIcon} title="Delivery" subtitle="A carrier brings it to your door" price="Quoted next" />
            <OptionRow name={`method-${g.storeId}`} value="pickup" checked={methods[g.storeId] === 'pickup'} onChange={() => setMethods((m) => ({ ...m, [g.storeId]: 'pickup' }))} icon={pickupIcon} title="Pickup" subtitle={`Pick your package yourself in ${g.pickupPlace}`} price="Free" />
          </div>
          <Field label="Note for this seller" htmlFor={`cc-note-${g.storeId}`} hint="Optional">
            <textarea id={`cc-note-${g.storeId}`} value={notes[g.storeId] ?? ''} maxLength={500} rows={1} onChange={(e) => setNotes((n) => ({ ...n, [g.storeId]: e.target.value }))} className={`${inputClass} h-auto rounded-[20px] py-[12px]`} style={jakarta(400)} />
          </Field>
        </div>
      ))}
      {error && (
        <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px]" style={jakarta(400)}>
          {error}
        </p>
      )}
    </Shell>
  )
}
