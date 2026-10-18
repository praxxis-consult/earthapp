import { orderFromOverview } from './overview'
import type { Order, OrderStatus } from './orders'
import type { OrderSummary } from '../feature/orders/ordersApiSlice'

/**
 * The buyer's orders ("My orders"), in the shape the shared order columns draw. The API
 * answers the same summary it gives the seller's overview, so one mapper serves both.
 */
export const purchaseFromApi = (o: OrderSummary): Order => orderFromOverview(o)

export type PurchaseTab = 'all' | OrderStatus

/** The tabs on the buyer's orders page; declined orders sit with the cancelled ones, as on the seller's. */
export const PURCHASE_TABS: { key: PurchaseTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'Awaiting seller' },
  { key: 'processing', label: 'Being prepared' },
  { key: 'ready', label: 'Ready for pickup' },
  { key: 'dispatched', label: 'On the way' },
  { key: 'completed', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

export const purchaseTabMatches = (tab: PurchaseTab, status: OrderStatus): boolean =>
  tab === 'all' || status === tab || (tab === 'cancelled' && status === 'declined')

/** The figures on the buyer's stat cards. */
export interface PurchaseStats {
  total: number
  awaiting: number
  inProgress: number
  completed: number
}

export function purchaseStats(orders: Order[]): PurchaseStats {
  const s: PurchaseStats = { total: orders.length, awaiting: 0, inProgress: 0, completed: 0 }
  for (const o of orders) {
    if (o.status === 'new') s.awaiting += 1
    else if (o.status === 'processing' || o.status === 'ready' || o.status === 'dispatched') s.inProgress += 1
    else if (o.status === 'completed') s.completed += 1
  }
  return s
}

/** The rows a search keeps: order id, store or item. */
export function filterPurchases(orders: Order[], tab: PurchaseTab, query: string): Order[] {
  const q = query.trim().toLowerCase()
  return orders.filter(
    (o) =>
      purchaseTabMatches(tab, o.status) &&
      (!q || o.id.toLowerCase().includes(q) || o.item.soldBy.toLowerCase().includes(q) || o.item.title.toLowerCase().includes(q)),
  )
}

/** Only an order the seller has not started on can be cancelled by the buyer. */
export const canCancel = (status: OrderStatus): boolean => status === 'new'
