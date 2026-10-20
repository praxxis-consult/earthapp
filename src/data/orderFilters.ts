import type { Order } from './orders'

/**
 * The orders table's narrowing beyond the status tabs: the date range beside the search, and the
 * Filters menu (delivery method, payment, sort). Everything here is pure, so the page just applies
 * it to the rows it has; the list API returns every order of the store and pages nothing.
 */

export const RANGES = ['Last 7 days', 'Last 30 days', 'This month', 'All time'] as const
export type Range = (typeof RANGES)[number]

export function inRange(o: Pick<Order, 'placedAt'>, range: Range, now: Date): boolean {
  const d = new Date(o.placedAt)
  const days = (now.getTime() - d.getTime()) / 86_400_000
  if (range === 'Last 7 days') return days <= 7
  if (range === 'Last 30 days') return days <= 30
  if (range === 'This month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  return true
}

export interface OrderFilters {
  delivery: 'any' | 'shipping' | 'pickup'
  payment: 'any' | 'paid' | 'unpaid'
  sort: 'newest' | 'oldest' | 'highest' | 'lowest'
}
export const DEFAULT_FILTERS: OrderFilters = { delivery: 'any', payment: 'any', sort: 'newest' }

export interface FilterGroup<K extends string = string> {
  key: K
  label: string
  options: { value: string; label: string }[]
}
/** What the Filters menu offers, in its order. */
export const ORDER_FILTER_GROUPS: FilterGroup<keyof OrderFilters>[] = [
  {
    key: 'delivery',
    label: 'Delivery',
    options: [
      { value: 'any', label: 'Any' },
      { value: 'shipping', label: 'Shipping' },
      { value: 'pickup', label: 'Pickup' },
    ],
  },
  {
    key: 'payment',
    label: 'Payment',
    options: [
      { value: 'any', label: 'Any' },
      { value: 'paid', label: 'Paid' },
      { value: 'unpaid', label: 'Awaiting payment' },
    ],
  },
  {
    key: 'sort',
    label: 'Sort by',
    options: [
      { value: 'newest', label: 'Newest first' },
      { value: 'oldest', label: 'Oldest first' },
      { value: 'highest', label: 'Highest total' },
      { value: 'lowest', label: 'Lowest total' },
    ],
  },
]

/** How many choices differ from the defaults (the count on the Filters button). */
export const activeFilterCount = (f: OrderFilters): number => (Object.keys(DEFAULT_FILTERS) as (keyof OrderFilters)[]).filter((k) => f[k] !== DEFAULT_FILTERS[k]).length

const orderTotal = (o: Order) => o.payment.subtotal + o.payment.fee - o.payment.discount + o.delivery.amountPaid

/** The rows that pass the menu's choices, in the chosen order. */
export function applyFilters(orders: Order[], f: OrderFilters): Order[] {
  const kept = orders.filter((o) => {
    if (f.delivery === 'pickup' && o.delivery.method !== 'Pickup') return false
    if (f.delivery === 'shipping' && o.delivery.method === 'Pickup') return false
    if (f.payment === 'paid' && !o.paid) return false
    if (f.payment === 'unpaid' && o.paid) return false
    return true
  })
  const by: Record<OrderFilters['sort'], (a: Order, b: Order) => number> = {
    newest: (a, b) => b.placedAt.localeCompare(a.placedAt),
    oldest: (a, b) => a.placedAt.localeCompare(b.placedAt),
    highest: (a, b) => orderTotal(b) - orderTotal(a) || b.placedAt.localeCompare(a.placedAt),
    lowest: (a, b) => orderTotal(a) - orderTotal(b) || b.placedAt.localeCompare(a.placedAt),
  }
  return kept.sort(by[f.sort])
}
