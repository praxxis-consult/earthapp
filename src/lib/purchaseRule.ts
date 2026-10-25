import { problemMembers } from '../app/api/problem'
import { nairaFromMinor } from './productView'
import { plural } from './listing'

/**
 * Why a purchase was refused (25 October, "purchase conflict rule"): the API keeps the 409
 * `orders/state-conflict` problem and adds `rule` plus `productId` with the numbers behind it,
 * on `POST /orders` and as `failure` on a cancelled combined checkout. Money is a string in
 * minor units. Generic order-state conflicts carry no rule.
 */
export type PurchaseRule =
  | { rule: 'moq'; productId: string; minimumQuantity: number; requestedQuantity: number }
  | { rule: 'stock'; productId: string; availableQuantity: number; requestedQuantity: number }
  | { rule: 'price'; productId: string; quotedPriceMinor: string; currentPriceMinor: string; currency: string }
  | { rule: 'currency'; productId: string }
  | { rule: 'unavailable'; productId: string }
  | { rule: 'product_changed'; productId: string; changedFields: string[] }

const RULES = new Set(['moq', 'stock', 'price', 'currency', 'unavailable', 'product_changed'])

/** The rule a problem (an ApiError, a problem body or a checkout's `failure`) names, or null when it names none. */
export function purchaseRule(source: unknown): PurchaseRule | null {
  const m = problemMembers(source)
  if (typeof m.rule !== 'string' || !RULES.has(m.rule) || typeof m.productId !== 'string') return null
  return m as unknown as PurchaseRule
}

/** How a caller names the product the rule is about: its title and the word for one unit ("bag"). */
export type ProductNamer = (productId: string) => { title: string; unit: string } | undefined

/** The fields the message quotes; `product_changed` names them the way the API does. */
const FIELD_WORDS: Record<string, string> = { price: 'price', unitPriceMinor: 'price', moq: 'minimum quantity', minimumQuantity: 'minimum quantity', availableQuantity: 'stock', currency: 'currency', soldAs: 'unit', status: 'availability' }

/**
 * What the buyer can do about a refused purchase, in a sentence that names the product and the
 * rule: "Ofada Rice: the minimum order is 20 bags and you asked for 5." Without a namer the
 * product is "This product".
 */
export function purchaseRuleMessage(r: PurchaseRule, nameOf?: ProductNamer): string {
  const p = nameOf?.(r.productId)
  const name = p?.title ?? 'This product'
  const units = (n: number) => (p ? plural(n, p.unit) : String(n))
  switch (r.rule) {
    case 'moq':
      return `${name}: the minimum order is ${units(r.minimumQuantity)} and you asked for ${units(r.requestedQuantity)}. Raise the quantity to at least ${units(r.minimumQuantity)} and try again.`
    case 'stock':
      return r.availableQuantity <= 0
        ? `${name} is out of stock right now. Remove it, or message the seller about when more comes in.`
        : `${name}: only ${units(r.availableQuantity)} left and you asked for ${units(r.requestedQuantity)}. Lower the quantity and try again.`
    case 'price':
      return `${name}: the price changed from ${nairaFromMinor(r.quotedPriceMinor)} to ${nairaFromMinor(r.currentPriceMinor)}${p ? ` per ${p.unit}` : ''}. Check the new price and try again.`
    case 'currency':
      return `${name} is now priced in another currency. Check the listing and try again.`
    case 'unavailable':
      return `${name} is no longer available. Remove it and try again.`
    case 'product_changed': {
      const fields = [...new Set(r.changedFields.map((f) => FIELD_WORDS[f] ?? f.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()))]
      return `${name} changed just now${fields.length ? ` (${fields.join(', ')})` : ''}. Check the listing and try again.`
    }
  }
}
