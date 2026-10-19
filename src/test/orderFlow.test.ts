import { describe, it, expect } from 'vitest'
import { awaitingPayment, canCancel, cancelMeaning, confirmOutcome, isPaid, mmss, paymentExpired, paymentSecondsLeft, sellerStep, stepTime, timelineView, trackingView } from '../data/orderFlow'
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
    expect(q).toEqual({ id: '01a15641', name: 'Bubble Express', delivery: '₦4,095.96', total: '₦29,095.96', goods: '₦25,000.00', expiresAt: '2026-10-19T22:24:06.574Z', eta: 'Within 21 hrs', acceptMinutes: 60 })
    expect(secondsLeft(q, Date.parse('2026-10-19T22:22:00Z'), Date.parse('2026-10-19T22:23:36.574Z'))).toBe(30)
    // the commission is the seller's, not the buyer's: goods + delivery = the buyer total
    expect(2500000 + 372360 + 37236).toBe(2909596)
  })
  it('degrades to the id when an offer names nothing, with two minutes from arrival', () => {
    const bare = quoteView({ id: 'q2' }, 1)
    expect(bare).toEqual({ id: 'q2', name: 'Carrier option 2', delivery: '', total: '', goods: '', expiresAt: null, eta: '', acceptMinutes: null })
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
