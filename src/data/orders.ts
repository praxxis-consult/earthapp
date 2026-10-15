
import { sampleOrders } from './orders.sample'

export type OrderStatus = 'new' | 'processing' | 'ready' | 'dispatched' | 'completed' | 'cancelled' | 'declined'

export type DeliveryMethod = 'Motorbike' | 'Pickup' | 'Car'

export interface Order {
  id: string
  /** Display form from the design, e.g. "September 24, 01:35AM". */
  placed: string
  /** ISO timestamp, for sorting and the detail page header. */
  placedAt: string
  buyer: {
    name: string
    since: string
    address: string
  }
  item: {
    title: string
    sku: string
    soldBy: string
    qty: number
    weightKg: number
    unit: string
    price: number
    onSale: boolean
    image: string
  }
  delivery: {
    method: DeliveryMethod
    courier: string
    address: string
    expected: string
    amountPaid: number
  }
  payment: {
    subtotal: number
    fee: number
    discount: number
  }
  note?: string
  status: OrderStatus
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'New order',
  processing: 'Processing',
  ready: 'Ready for pickup',
  dispatched: 'Dispatched',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
}

/** Badge colours per status (Figma "Order status" cells, orders 561:3325). */
export const STATUS_STYLE: Record<OrderStatus, { bg: string; color: string }> = {
  new: { bg: '#eaf2ff', color: '#4385ed' },
  processing: { bg: '#fff6dd', color: '#a66608' },
  ready: { bg: 'rgba(138,88,255,0.1)', color: '#8a58ff' },
  dispatched: { bg: 'rgba(184,0,204,0.08)', color: '#b800cc' },
  completed: { bg: '#eaf8f0', color: '#177b4d' },
  cancelled: { bg: '#fff0f0', color: '#b13b3b' },
  declined: { bg: '#fff0f0', color: '#b13b3b' },
}

export const naira = (n: number) =>
  '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const orderTotal = (o: Order) => o.payment.subtotal + o.payment.fee - o.payment.discount

/**
 * The store's orders. The API has no orders endpoint yet, so this is empty and every order
 * page shows its zero state; the endpoint's rows replace this list.
 *
 * In development only, the sample rows in ./orders.sample.ts can be switched on to look at the
 * pages: open any dashboard URL with `?sample=1` (and `?sample=0` to switch back). The choice
 * is remembered in this browser; production builds never include the samples.
 */
function sampleMode(): boolean {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false
  const wanted = new URLSearchParams(window.location.search).get('sample')
  if (wanted !== null) localStorage.setItem('earth.sample', wanted === '1' ? '1' : '0')
  return localStorage.getItem('earth.sample') === '1'
}
export const orders: Order[] = sampleMode() ? sampleOrders : []

export const findOrder = (id: string | undefined) => orders.find((o) => o.id === id)
