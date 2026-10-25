import { describe, it, expect } from 'vitest'
import { purchaseRule, purchaseRuleMessage, type ProductNamer } from '../lib/purchaseRule'
import { toApiError } from '../app/api/problem'
import { checkoutProblem } from '../feature/checkout/useCheckout'
import { capacityMessage } from '../data/quotes'
import { plural } from '../lib/listing'

// The live 409 from POST /orders on 25 October: copper (MOQ 20) asked for as 1.
const LIVE_409 = { status: 409, data: { type: 'https://earth.example/problems/orders/state-conflict', title: 'Product availability, currency or minimum quantity changed.', status: 409, detail: 'Product availability, currency or minimum quantity changed.', rule: 'moq', productId: '01a159f9-15d2-7d78-b4f1-05e3f8e350ae', minimumQuantity: 20, requestedQuantity: 1 } }
const names: ProductNamer = (id) => (id === '01a159f9-15d2-7d78-b4f1-05e3f8e350ae' ? { title: 'Copper cathode', unit: 'ton' } : undefined)

describe('purchase conflict rule', () => {
  it('keeps the problem’s extension members on the error, so the rule survives the API layer', () => {
    const e = toApiError(LIVE_409)
    expect(e.members).toMatchObject({ rule: 'moq', minimumQuantity: 20, requestedQuantity: 1 })
    expect(e.members).not.toHaveProperty('title')
    expect(purchaseRule(e)).toMatchObject({ rule: 'moq', productId: '01a159f9-15d2-7d78-b4f1-05e3f8e350ae' })
  })
  it('reads a cancelled checkout’s failure the same way, and ignores problems without a rule', () => {
    expect(purchaseRule({ rule: 'stock', productId: 'p', availableQuantity: 8, requestedQuantity: 20 })?.rule).toBe('stock')
    expect(purchaseRule(null)).toBeNull()
    expect(purchaseRule({ rule: 'something-new', productId: 'p' })).toBeNull()
    expect(purchaseRule(toApiError({ status: 409, data: { type: 'x/version-conflict' } }))).toBeNull()
  })
  it('says which rule, which product and the numbers, in the product’s own unit', () => {
    expect(purchaseRuleMessage(purchaseRule(toApiError(LIVE_409))!, names)).toBe('Copper cathode: the minimum order is 20 tons and you asked for 1 ton. Raise the quantity to at least 20 tons and try again.')
    expect(purchaseRuleMessage({ rule: 'stock', productId: 'p', availableQuantity: 8, requestedQuantity: 20 }, () => ({ title: 'Ofada Rice', unit: 'bag' }))).toBe('Ofada Rice: only 8 bags left and you asked for 20 bags. Lower the quantity and try again.')
    expect(purchaseRuleMessage({ rule: 'stock', productId: 'p', availableQuantity: 0, requestedQuantity: 2 })).toBe('This product is out of stock right now. Remove it, or message the seller about when more comes in.')
    expect(purchaseRuleMessage({ rule: 'price', productId: 'p', quotedPriceMinor: '1250000', currentPriceMinor: '1400000', currency: 'NGN' }, () => ({ title: 'Ofada Rice', unit: 'bag' }))).toBe('Ofada Rice: the price changed from ₦12,500.00 to ₦14,000.00 per bag. Check the new price and try again.')
    expect(purchaseRuleMessage({ rule: 'unavailable', productId: 'p' })).toBe('This product is no longer available. Remove it and try again.')
    expect(purchaseRuleMessage({ rule: 'currency', productId: 'p' })).toContain('another currency')
    expect(purchaseRuleMessage({ rule: 'product_changed', productId: 'p', changedFields: ['unitPriceMinor', 'moq', 'soldAs'] })).toBe('This product changed just now (price, minimum quantity, unit). Check the listing and try again.')
  })
  it('names the rule on a cancelled checkout before falling back to the problem type', () => {
    expect(checkoutProblem({ problemType: 'orders/state-conflict', failure: { rule: 'moq', productId: 'p', minimumQuantity: 20, requestedQuantity: 1 } })).toMatch(/^This product: the minimum order is 20 /)
    expect(checkoutProblem({ problemType: 'orders/state-conflict', failure: null })).toContain('Something in the cart changed just now')
    expect(checkoutProblem({ problemType: 'financial/invalid' })).toContain('more than its seller can take')
  })
  it('pluralises unit words but never symbols or abbreviations', () => {
    expect([plural(20, 'kg'), plural(1, 'bag'), plural(20, 'bag'), plural(3, 'box'), plural(2, 'ton'), plural(5, 'pcs'), plural(4, 'L')]).toEqual(['20 kg', '1 bag', '20 bags', '3 boxes', '2 tons', '5 pcs', '4 L'])
    expect(purchaseRuleMessage({ rule: 'moq', productId: 'p', minimumQuantity: 20, requestedQuantity: 1 }, () => ({ title: 'Copper Ore', unit: 'kg' }))).toBe('Copper Ore: the minimum order is 20 kg and you asked for 1 kg. Raise the quantity to at least 20 kg and try again.')
  })
  it('lets the capacity message read the members off an ApiError too (it could only read a plain body before)', () => {
    const e = toApiError({ status: 409, data: { type: 'x/shipping-conflict', parcelCapacity: { maxWeightGrams: '200000', basketWeightGrams: '251000' } } })
    expect(capacityMessage(e)).toContain('251 kg')
  })
})
