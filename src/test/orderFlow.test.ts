import { describe, it, expect } from 'vitest'
import { awaitingPayment, buyerMoney, canCancel, cancelMeaning, confirmOutcome, isPaid, mmss, normalizeOrder, paymentExpired, paymentSecondsLeft, sellerMoney, sellerStep, stepTime, timelineView, trackingView } from '../data/orderFlow'
import type { OrderDetailRaw } from '../feature/orders/ordersApiSlice'
import { quoteRefusal, quoteView, secondsLeft } from '../data/quotes'

const T0 = Date.parse('2026-10-19T12:00:00Z')

describe('payment window', () => {
  it('is open for an unpaid order inside its fifteen minutes and closed after', () => {
    const o = { paymentStatus: 'PENDING', expiresAt: '2026-10-19T12:15:00Z', status: 'PENDING' }
    expect(awaitingPayment(o, T0)).toBe(true)
    expect(paymentSecondsLeft(o, T0)).toBe(900)
    expect(mmss(paymentSecondsLeft(o, T0 + 61_000))).toBe('13:59')
    expect(paymentExpired(o, T0 + 15 * 60_000)).toBe(true)
    expect(awaitingPayment(o, T0 + 15 * 60_000)).toBe(false)
  })
  it('never counts a paid or closed order as awaiting payment', () => {
    expect(isPaid({ paymentStatus: 'PAID' })).toBe(true)
    expect(paymentExpired({ paymentStatus: 'PAID', expiresAt: '2000-01-01T00:00:00Z' }, T0)).toBe(false)
    expect(awaitingPayment({ paymentStatus: 'PENDING', expiresAt: '2026-10-19T12:15:00Z', status: 'CANCELLED' }, T0)).toBe(false)
    expect(awaitingPayment({ paymentStatus: 'PENDING', expiresAt: null, status: 'PENDING' }, T0)).toBe(true)
  })
})

describe('who can do what', () => {
  it('lets the buyer cancel until the carrier has collected, with the right meaning', () => {
    expect(canCancel('new')).toBe(true)
    expect(cancelMeaning('new')).toMatch(/refunded/)
    expect(cancelMeaning('processing')).toMatch(/carrier/)
    expect(canCancel('ready')).toBe(true)
    expect(canCancel('dispatched')).toBe(false)
    expect(canCancel('completed')).toBe(false)
    expect(canCancel('cancelled')).toBe(false)
  })
  it('gives the seller one next step per stage', () => {
    expect(sellerStep('new')).toBe('accept')
    expect(sellerStep('processing')).toBe('ready')
    expect(sellerStep('ready')).toBe('dispatch')
    expect(sellerStep('dispatched')).toBe('complete')
    expect(sellerStep('completed')).toBeNull()
    expect(sellerStep('declined')).toBeNull()
  })
})

describe('lenient readers', () => {
  it('reads a timeline event by whichever name it carries and finds a step from it', () => {
    expect(timelineView({ type: 'order.accepted', occurredAt: '2026-10-19T13:00:00Z' })).toEqual({ label: 'Accepted', at: '2026-10-19T13:00:00Z' })
    expect(timelineView({ status: 'READY_FOR_PICKUP', at: 'x' })).toEqual({ label: 'Ready for pickup', at: 'x' })
    expect(timelineView({})).toEqual({ label: 'Event', at: null })
    const events = [{ type: 'order.created', at: 'a' }, { type: 'payment.verified', at: 'b' }, { kind: 'ACCEPTED', createdAt: 'c' }]
    expect(stepTime(events, 'accept')).toBe('c')
    expect(stepTime(events, 'paid', 'payment')).toBe('b')
    expect(stepTime(events, 'deliver')).toBeNull()
  })
  it('reads the carrier booking for tracking, and nothing when there is none', () => {
    expect(trackingView(null)).toBeNull()
    expect(trackingView({})).toBeNull()
    expect(trackingView({ trackingUrl: 'https://t/1', trackingNumber: 'SB1', courier: { name: 'GIG' } })).toEqual({ url: 'https://t/1', number: 'SB1', courier: 'GIG' })
  })
  it('reads a quote as the API answers it: carrier, estimate, delivery = carrier + markup, buyer total', () => {
    const real = { id: '01a15641', provider: 'shipbubble', carrierName: 'Bubble Express', service: 'test_1_courier', deliveryEstimate: 'Within 21 hrs', expiresAt: '2026-10-19T22:24:06.574Z', acceptance: { minutes: 60, basis: 'ELAPSED_NO_SCHEDULE', openingHours: null }, policyId: 'earth-ngn-2026-10-16', currency: 'NGN', goods: '2500000', carrier: '372360', commission: '187500', deliveryMarkup: '37236', tax: '0', buyerTotal: '2909596', sellerAllocation: '2312500', carrierAllocation: '372360', earthAllocation: '224736' }
    const q = quoteView(real, 0)
    expect(q).toEqual({ id: '01a15641', name: 'Bubble Express', delivery: '₦4,095.96', deliveryNum: 4095.96, total: '₦29,095.96', goods: '₦25,000.00', expiresAt: '2026-10-19T22:24:06.574Z', eta: 'Within 21 hrs', acceptMinutes: 60 })
    expect(secondsLeft(q, Date.parse('2026-10-19T22:22:00Z'), Date.parse('2026-10-19T22:23:36.574Z'))).toBe(30)
    // the commission is the seller's, not the buyer's: goods + delivery = the buyer total
    expect(2500000 + 372360 + 37236).toBe(2909596)
  })
  it('degrades to the id when an offer names nothing, with two minutes from arrival', () => {
    const bare = quoteView({ id: 'q2' }, 1)
    expect(bare).toEqual({ id: 'q2', name: 'Carrier option 2', delivery: '', deliveryNum: undefined, total: '', goods: '', expiresAt: null, eta: '', acceptMinutes: null })
    expect(secondsLeft(bare, T0, T0 + 100_000)).toBe(20)
    expect(secondsLeft(bare, T0, T0 + 130_000)).toBe(0)
  })
  it('reads the confirm answer on the API’s word only', () => {
    expect(confirmOutcome({ status: 'PAID', orderStatus: 'PENDING', refundRequired: false }).paid).toBe(true)
    expect(confirmOutcome({ status: 'PAID', refundRequired: true }).title).toBe('Paid, but too late')
    expect(confirmOutcome({ status: 'PREPARING' }).paid).toBe(false)
    expect(confirmOutcome({}).paid).toBe(false)
  })
})

describe('a refused quote', () => {
  it('names whose address the carrier refused and marks only the buyer’s fields', () => {
    const both = quoteRefusal([{ path: 'pickup', code: 'provider_address_rejected' }, { path: 'address', code: 'provider_address_rejected' }])
    expect(both.message).toMatch(/not about your address/)
    expect(both.fields).toEqual({})
    const mine = quoteRefusal([{ path: 'address', code: 'provider_address_rejected' }])
    expect(Object.keys(mine.fields)).toEqual(['street', 'area', 'postalCode'])
    const pickup = quoteRefusal([{ path: 'pickup' }])
    expect(pickup.message).toMatch(/seller’s pickup address/)
    expect(pickup.fields).toEqual({})
    expect(quoteRefusal([{ path: 'address.postalCode' }]).fields.postalCode).toBeTruthy()
    expect(quoteRefusal([]).message).toMatch(/could not quote/)
  })
})

/** `GET /orders/{id}` as Ralph's server answered it on 19 October (trimmed). */
const REAL: OrderDetailRaw = {
  id: '01a1564d-e888-72ae-8dcd-793c42120e26', storeId: '01a12049', buyerId: '01a15632', sellerId: '01a12042', version: 4, status: 'PENDING', paymentStatus: 'VERIFIED',
  paymentReviewReason: null, reservationStatus: 'CONSUMED', cancellationRequested: false, refundRequired: false,
  createdAt: '2026-10-19T22:35:42.096Z', expiresAt: '2026-10-19T22:50:42.096Z', paidAt: '2026-10-19T22:36:05.000Z', acceptanceDeadline: '2026-10-19T23:36:05.000Z',
  acceptancePolicy: { minutes: 60, basis: 'ELAPSED_NO_SCHEDULE', openingHours: null }, refundedMinor: '0', refundOutstandingMinor: '0',
  buyerName: 'Ogagaoghene Akpolo', customerSince: '2026-10-19T22:04:53.295Z', amountPaid: '2909596', deliveryMethod: 'SHIPPING', storeName: 'Ada Farm Store', note: null,
  items: [{ productId: '01a121e8', name: 'Premium Ofada Rice', thumbnail: 'https://images.example.com/ofada-rice-front.jpg', priceMinor: '1250000', quantity: 2, weightGrams: 5000, perishable: null }],
  address: { country: 'NG', region: 'Lagos', area: 'Apapa', street: '1 Akpolo Street, Ojo Road', landmark: 'Mile 2', postalCode: '101251', firstName: 'Ogagaoghene', lastName: 'Akpolo', phone: '+2348061725898', email: 'b@example.com' },
  pickup: { country: 'NG', region: 'Lagos', area: 'Ikeja', street: '108 Opebi Road', landmark: 'Opebi Road', postalCode: '100001', firstName: 'Ada', lastName: 'Obi', phone: '+2348031234567', email: 'a@example.com' },
  delivery: { provider: 'shipbubble', carrier: 'Bubble Express', service: 'test_1_courier', estimate: 'Within 20 hrs' },
  pricing: { policyId: 'earth-ngn-2026-10-16', currency: 'NGN', goods: '2500000', carrier: '372360', commission: '187500', deliveryMarkup: '37236', tax: '0', buyerTotal: '2909596', sellerAllocation: '2312500', carrierAllocation: '372360', earthAllocation: '224736' },
  timeline: { items: [
    { sequence: 1, kind: 'order.created', actor_id: '01a15632', actor_kind: 'ACCOUNT', reason: null, created_at: '2026-10-19T22:35:42.096Z' },
    { sequence: 2, kind: 'payment.initializing', actor_id: null, actor_kind: 'SYSTEM', reason: null, created_at: '2026-10-19T22:35:43.587Z' },
    { sequence: 3, kind: 'payment.pending', actor_id: null, reason: null, created_at: '2026-10-19T22:35:44.377Z' },
    { sequence: 4, kind: 'payment.verified', actor_id: null, reason: null, created_at: '2026-10-19T22:36:30.745Z' },
  ] },
  fulfillmentDelivery: { status: 'PREPARING', tracking: null, confirmedPickup: null, checkedAt: '2026-10-19T22:37:48.093Z' },
}

describe('the real order record', () => {
  it('normalises the detail into the list shape the pages read, and counts VERIFIED as paid', () => {
    const o = normalizeOrder(REAL)
    expect(o.item).toEqual({ name: 'Premium Ofada Rice', thumbnail: 'https://images.example.com/ofada-rice-front.jpg', quantity: 2, weightGrams: 5000, priceMinor: '1250000' })
    expect(o.itemCount).toBe(1)
    expect(o.firstItem).toBe('Premium Ofada Rice')
    expect(o.total).toBe('2909596')
    expect(o.currency).toBe('NGN')
    expect(isPaid(o)).toBe(true)
    expect(awaitingPayment(o)).toBe(false)
    expect(o.address?.street).toBe('1 Akpolo Street, Ojo Road')
    expect(o.delivery?.carrier).toBe('Bubble Express')
    // a list row passes through untouched
    const row = normalizeOrder({ ...o, items: undefined } as never)
    expect(row.item.name).toBe('Premium Ofada Rice')
  })
  it('splits the money for each side from the pricing', () => {
    expect(buyerMoney(REAL.pricing, REAL.amountPaid)).toEqual({ goods: 25000, delivery: 4095.96, total: 29095.96 })
    expect(sellerMoney(REAL.pricing, REAL.amountPaid)).toEqual({ goods: 25000, commission: 1875, share: 23125 })
    expect(buyerMoney(undefined, '2909596').total).toBe(29095.96)
  })
  it('reads the real timeline kinds and times, and finds the payment step by it', () => {
    const events = REAL.timeline!.items
    expect(timelineView(events[3])).toEqual({ label: 'Payment verified', at: '2026-10-19T22:36:30.745Z' })
    expect(stepTime(events, 'verified')).toBe('2026-10-19T22:36:30.745Z')
    expect(stepTime(events, 'accept')).toBeNull()
    expect(trackingView(REAL.fulfillmentDelivery as never)).toBeNull()
    expect(trackingView({ status: 'BOOKED', tracking: { waybill: 'SB-1', url: 'https://t/1' } })).toEqual({ url: 'https://t/1', number: 'SB-1', courier: '' })
  })
})
