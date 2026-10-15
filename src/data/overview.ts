import { orders } from './orders'
import salesGraph from '../assets/images/db-graph-sales.svg'
import salesEmptyGraph from '../assets/images/db-graph-sales-empty.svg'
import viewsGraph from '../assets/images/db-graph-views.svg'
import viewsEmptyGraph from '../assets/images/db-graph-views-empty.svg'

/**
 * The overview's numbers (dashboard 459:1048). The API has no overview endpoint yet, so these
 * are the frame's own figures; the page reads only this shape, so the endpoint slots in here.
 */
export interface ChartPin {
  /** The day the pin sits on, as the frame writes it ("Wed."). */
  label: string
  value: string
  /** A lighter unit after the value ("views"), where the frame has one. */
  suffix?: string
  /** The pin frame's top-left inside the 539×270 graph, as measured on the frame. */
  x: number
  y: number
}

export interface Overview {
  earnedThisWeek: string
  awaitingOrders: number
  completedOrders: number
  rating: string
  reviews: number
  sales: { graph: string; pin: ChartPin }
  views: { graph: string; pin: ChartPin }
  recentOrders: typeof orders
}

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']

export const overview: Overview = {
  earnedThisWeek: '₦16,178.75',
  awaitingOrders: 0,
  completedOrders: 3,
  rating: '4.8',
  reviews: 2,
  sales: { graph: salesGraph, pin: { label: 'Wed.', value: '₦4,700.05', x: 273.5, y: 112.6 } },
  views: { graph: viewsGraph, pin: { label: 'Tue.', value: '23', suffix: 'views', x: 185, y: 161 } },
  recentOrders: orders.slice(0, 2),
}

/** The same page before the first order (dashboard 431:4736): zeros, flat graphs, no rows. */
export const emptyOverview: Overview = {
  earnedThisWeek: '₦0.00',
  awaitingOrders: 0,
  completedOrders: 0,
  rating: '0',
  reviews: 0,
  sales: { graph: salesEmptyGraph, pin: { label: 'Wed.', value: '₦0.00', x: 273.5, y: 112.6 } },
  views: { graph: viewsEmptyGraph, pin: { label: 'Tue.', value: '0', x: 185, y: 161 } },
  recentOrders: [],
}
