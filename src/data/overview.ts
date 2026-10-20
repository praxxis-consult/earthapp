import { naira, type Order, type OrderStatus } from './orders'
import { PAID_STATES } from './orderFlow'
import type { Overview as ApiOverview, OverviewOrder } from '../feature/overview/overviewApiSlice'

/**
 * The overview's numbers (dashboard 459:1048 populated, 431:4736 before the first order), in
 * the shape the page draws. `fromApi` fills it from `GET /stores/me/overview`; `zero` is what
 * the page shows until the API answers or while the seller has no store.
 */
export interface ChartSeries {
  /** One value per day, Sunday first. */
  values: number[]
  /** The day whose tooltip shows until the pointer picks another. */
  highlight: number
  /** How a value reads in the tooltip ("₦4,700.05", "23 views"). */
  format: (value: number) => { value: string; suffix?: string }
}

export interface Overview {
  earnedThisWeek: string
  awaitingOrders: number
  completedOrders: number
  rating: string
  reviews: number
  sales: ChartSeries
  views: ChartSeries
  recentOrders: Order[]
}

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']

/** Where each day's point sits across the frame's 539px graph: the centres of its day labels. */
export const DAY_X = [38, 117.5, 196, 275.5, 357, 432, 504.5]

const money = (value: number) => ({ value: naira(value) })
const views = (value: number) => ({ value: String(value), suffix: 'views' })
const WEEK = [0, 0, 0, 0, 0, 0, 0]

/** Zero everywhere until the API reports the store's activity; the frame pins Wednesday and Tuesday. */
export const zero: Overview = {
  earnedThisWeek: naira(0),
  awaitingOrders: 0,
  completedOrders: 0,
  rating: '0',
  reviews: 0,
  sales: { values: WEEK, highlight: 3, format: money },
  views: { values: WEEK, highlight: 2, format: views },
  recentOrders: [],
}

/** The API's order states, as the dashboard's badges name them. */
export const STATUS_FROM_API: Record<string, OrderStatus> = {
  PENDING: 'new',
  ACCEPTED: 'processing',
  READY: 'ready',
  DISPATCHED: 'dispatched',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DECLINED: 'declined',
}

const placedLabel = (iso: string) => {
  const d = new Date(iso)
  return `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
}

/** An overview row as the shared order columns draw it; what the overview does not carry stays blank. */
export function orderFromOverview(o: OverviewOrder): Order {
  return {
    id: o.id,
    placed: placedLabel(o.createdAt),
    placedAt: o.createdAt,
    buyer: { name: o.buyerName, since: '', address: '' },
    item: {
      title: o.item.name,
      sku: '',
      soldBy: o.storeName,
      qty: o.item.quantity,
      weightKg: Math.round(o.item.weightGrams / 100) / 10,
      unit: '',
      price: Number(o.item.priceMinor) / 100,
      onSale: true,
      image: o.item.thumbnail ?? '',
    },
    delivery: { method: String(o.deliveryMethod).toUpperCase() === 'PICKUP' ? 'Pickup' : 'Shipping', courier: '', address: '', expected: '', amountPaid: 0 },
    payment: { subtotal: Number(o.total) / 100, fee: 0, discount: 0 },
    paid: PAID_STATES.includes(String(o.paymentStatus).toUpperCase()),
    status: STATUS_FROM_API[o.status] ?? 'new',
  }
}

/** One value per weekday, Sunday first, from the API's dated series (its days may start anywhere in the week). */
function weekSeries(days: { date: string; amountMinor?: string; count?: string }[], pick: (d: { amountMinor?: string; count?: string }) => number): number[] {
  const out = [...WEEK]
  for (const d of days) out[new Date(`${d.date}T00:00:00Z`).getUTCDay()] = pick(d)
  return out
}

/** The API's seven days in the page's shape; the tooltip starts on the busiest day. */
export function fromApi(a: ApiOverview): Overview {
  const sales = weekSeries(a.sales, (d) => Number(d.amountMinor ?? 0) / 100)
  const viewsSeries = weekSeries(a.productViews, (d) => Number(d.count ?? 0))
  const peak = (v: number[]) => (v.some((x) => x > 0) ? v.indexOf(Math.max(...v)) : 3)
  return {
    earnedThisWeek: naira(Number(a.earnings.amountMinor) / 100),
    awaitingOrders: Number(a.awaitingOrderCount) || 0,
    completedOrders: Number(a.completedOrderCount) || 0,
    rating: a.rating.average ? Number(a.rating.average).toFixed(1) : '0',
    reviews: Number(a.rating.count) || 0,
    sales: { values: sales, highlight: peak(sales), format: money },
    views: { values: viewsSeries, highlight: peak(viewsSeries), format: views },
    recentOrders: a.latestOrders.map(orderFromOverview),
  }
}
