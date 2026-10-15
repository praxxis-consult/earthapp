import { naira, type Order } from './orders'

/**
 * The overview's numbers (dashboard 459:1048 populated, 431:4736 before the first order). The
 * API has no overview endpoint yet, so every figure is zero and there are no rows; the page
 * reads only this shape, so the endpoint slots in here without touching the page.
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
export const overview: Overview = {
  earnedThisWeek: naira(0),
  awaitingOrders: 0,
  completedOrders: 0,
  rating: '0',
  reviews: 0,
  sales: { values: WEEK, highlight: 3, format: money },
  views: { values: WEEK, highlight: 2, format: views },
  recentOrders: [],
}
