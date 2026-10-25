import type { CartItem } from '../feature/cart/cartApiSlice'
import type { Listing } from './catalog'

/** The lines of one store: what one quote, and so one order, can hold. */
export interface CartGroup {
  storeId: string
  items: CartItem[]
}

/** A listing's quantity, kept between its minimum order and what is available (at least the minimum when nothing is left). */
export const clampQuantity = (p: Pick<Listing, 'moq' | 'available'>, n: number) => Math.min(Math.max(p.moq, Math.round(n) || p.moq), Math.max(p.available, p.moq))

/** The cart grouped by store, in the order stores were first added to it. */
export function groupItems(items: CartItem[]): CartGroup[] {
  const groups: CartGroup[] = []
  for (const item of items) {
    let g = groups.find((x) => x.storeId === item.storeId)
    if (!g) groups.push((g = { storeId: item.storeId, items: [] }))
    g.items.push(item)
  }
  return groups
}

/** The lines after adding `quantity` of a listing: a new line, or more on the line it already has. Answers the lines and the line's quantity now. */
export function withAdded(items: CartItem[], p: Listing, quantity: number): { items: CartItem[]; quantity: number } {
  const at = items.findIndex((i) => i.productId === p.id)
  const next = clampQuantity(p, at >= 0 ? items[at].quantity + quantity : quantity)
  return {
    items: at >= 0 ? items.map((i, k) => (k === at ? { ...i, quantity: next } : i)) : [...items, { storeId: p.store.id, productId: p.id, quantity: next }],
    quantity: next,
  }
}
