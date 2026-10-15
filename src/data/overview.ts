import { naira, orders } from './orders'

/**
 * The overview's numbers (dashboard 459:1048). The API has no overview endpoint yet, so these
 * are the frame's own figures; the page reads only this shape, so the endpoint slots in here.
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
  recentOrders: typeof orders
}

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']

/** Where each day's point sits across the frame's 539px graph: the centres of its day labels. */
export const DAY_X = [38, 117.5, 196, 275.5, 357, 432, 504.5]

const money = (value: number) => ({ value: naira(value) })
const views = (value: number) => ({ value: String(value), suffix: 'views' })

export const overview: Overview = {
  earnedThisWeek: '₦16,178.75',
  awaitingOrders: 0,
  completedOrders: 3,
  rating: '4.8',
  reviews: 2,
  // The heights of the frame's curve at each day, scaled so Wednesday reads ₦4,700.05.
  sales: { values: [2081, 1432, 3516, 4700.05, 1356, 2314, 3249], highlight: 3, format: money },
  // The same curve, scaled so Tuesday reads 23 views.
  views: { values: [14, 9, 23, 31, 9, 15, 21], highlight: 2, format: views },
  recentOrders: orders.slice(0, 2),
}

/** The same page before the first order (dashboard 431:4736): zeros, flat lines, no rows. */
export const emptyOverview: Overview = {
  earnedThisWeek: '₦0.00',
  awaitingOrders: 0,
  completedOrders: 0,
  rating: '0',
  reviews: 0,
  sales: { values: [0, 0, 0, 0, 0, 0, 0], highlight: 3, format: money },
  views: { values: [0, 0, 0, 0, 0, 0, 0], highlight: 2, format: views },
  recentOrders: [],
}
