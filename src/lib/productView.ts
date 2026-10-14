import type { PickupHours, Product, Weekday } from '../services/earthApi'

/** The design's four listing states, read from the API's status and stock. */
export type ListingStatus = 'On Sale' | 'Draft' | 'Running Low' | 'Out of Stock'

/** Figma products 462:6490, status column. */
export const LISTING_STYLE: Record<ListingStatus, { bg: string; color: string }> = {
  'On Sale': { bg: '#eaf8f0', color: '#177b4d' },
  Draft: { bg: '#eaf2ff', color: '#2765c7' },
  'Running Low': { bg: '#fff6dd', color: '#a66608' },
  'Out of Stock': { bg: '#fff0f0', color: '#b13b3b' },
}

export const LOW_STOCK = 2

export function listingStatus(p: Pick<Product, 'status' | 'availableQuantity'>): ListingStatus {
  if (p.status === 'DRAFT') return 'Draft'
  const q = p.availableQuantity ?? 0
  if (q <= 0) return 'Out of Stock'
  if (q <= LOW_STOCK) return 'Running Low'
  return 'On Sale'
}

export const naira = (n: number | string) => {
  const v = typeof n === 'string' ? Number(n) : n
  if (!Number.isFinite(v)) return '—'
  return '₦' + v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)

export function weightLabel(grams?: number): string {
  if (!grams) return ''
  const kg = grams / 1000
  if (kg >= 1000) return `up to ${+(kg / 1000).toFixed(1)} tonnes`
  return `up to ${+kg.toFixed(1)} kg`
}

/** "Basket, up to 25 kg" as the list shows it, or "-" for a draft without a unit. */
export function soldAsLabel(p: Pick<Product, 'soldAs' | 'approximateWeightGrams'>): string {
  if (!p.soldAs) return '-'
  const w = weightLabel(p.approximateWeightGrams)
  return w ? `${cap(p.soldAs)}, ${w}` : cap(p.soldAs)
}

export function unitPlural(soldAs: string | undefined, n: number) {
  const u = (soldAs || 'unit').toLowerCase()
  return n === 1 ? u : u.endsWith('s') ? u : `${u}s`
}

export const TIMEZONE = 'Africa/Lagos'
const DAYS: Weekday[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

function hours(days: Weekday[], opens: string, closes: string): PickupHours {
  return { timezone: TIMEZONE, days: days.map((day) => ({ day, intervals: [{ opens, closes }] })) }
}

/** The pickup-hours dropdown's choices; the first is the design's example. */
export const PICKUP_PRESETS: { label: string; hours: PickupHours }[] = [
  { label: 'Mon - Sat 8:00AM - 6:00PM', hours: hours(DAYS.slice(0, 6), '08:00', '18:00') },
  { label: 'Mon - Fri 9:00AM - 5:00PM', hours: hours(DAYS.slice(0, 5), '09:00', '17:00') },
  { label: 'Mon - Sat 7:00AM - 7:00PM', hours: hours(DAYS.slice(0, 6), '07:00', '19:00') },
  { label: 'Every day 8:00AM - 8:00PM', hours: hours(DAYS, '08:00', '20:00') },
]

const SHORT: Record<Weekday, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
}
const LONG: Record<Weekday, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
}

const ampm = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`
}

/** "Monday–Saturday" and "8:00 AM–6:00 PM" for the detail page cards. */
export function pickupHoursLabel(h?: PickupHours): { days: string; time: string } {
  if (!h?.days?.length) return { days: 'Not set', time: '' }
  const ordered = DAYS.filter((d) => h.days.some((x) => x.day === d))
  const days =
    ordered.length === 7
      ? 'Every day'
      : ordered.length > 1
        ? `${LONG[ordered[0]]}–${LONG[ordered[ordered.length - 1]]}`
        : LONG[ordered[0]]
  const i = h.days[0].intervals[0]
  return { days, time: i ? `${ampm(i.opens)}–${ampm(i.closes)}` : '' }
}

/** The dropdown label for stored hours: a preset's name when it matches, else a summary. */
export function pickupPresetLabel(h?: PickupHours): string {
  if (!h) return ''
  const match = PICKUP_PRESETS.find((p) => JSON.stringify(p.hours) === JSON.stringify(h))
  if (match) return match.label
  const { days, time } = pickupHoursLabel(h)
  const short = h.days.map((d) => SHORT[d.day]).join(', ')
  return `${days === 'Every day' ? days : short} ${time}`
}
