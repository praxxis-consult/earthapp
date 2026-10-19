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
  it('reads a quote: id, a name, kobo total and expiry; and degrades to the id', () => {
    const q = quoteView({ id: 'q1', courierName: 'Kwik', total: '150000', expiresAt: '2026-10-19T12:02:00Z', eta: '1–2 days' }, 0)
    expect(q).toEqual({ id: 'q1', name: 'Kwik', total: '₦1,500.00', expiresAt: '2026-10-19T12:02:00Z', eta: '1–2 days' })
    expect(secondsLeft(q, T0, T0 + 30_000)).toBe(90)
    const bare = quoteView({ id: 'q2' }, 1)
    expect(bare).toEqual({ id: 'q2', name: 'Carrier option 2', total: '', expiresAt: null, eta: '' })
    // no expiry on the offer: two minutes from when it arrived
    expect(secondsLeft(bare, T0, T0 + 100_000)).toBe(20)
    expect(secondsLeft(bare, T0, T0 + 130_000)).toBe(0)
    expect(quoteView({ id: 'q3', total: { amountMinor: '250000', currency: 'NGN' }, courier: { name: 'DHL' } }, 2).total).toBe('₦2,500.00')
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
    expect(both.message).toMatch(/both/)
    expect(Object.keys(both.fields)).toEqual(['street', 'area', 'postalCode'])
    const pickup = quoteRefusal([{ path: 'pickup' }])
    expect(pickup.message).toMatch(/seller’s pickup address/)
    expect(pickup.fields).toEqual({})
    expect(quoteRefusal([{ path: 'address.postalCode' }]).fields.postalCode).toBeTruthy()
    expect(quoteRefusal([]).message).toMatch(/could not quote/)
  })
})
