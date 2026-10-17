import type { OpeningHours } from '../services/earthApi'

/** "09:00 AM" ↔ "09:00": the dropdown speaks the design's 12-hour labels, the API 24-hour times. */
export const to24h = (label: string) => {
  const m = /^(\d{2}):(\d{2}) (AM|PM)$/.exec(label)
  if (!m) return '09:00'
  const h = (Number(m[1]) % 12) + (m[3] === 'PM' ? 12 : 0)
  return `${String(h).padStart(2, '0')}:${m[2]}`
}
export const to12h = (time: string) => {
  const [hh, mm] = time.split(':').map(Number)
  if (!Number.isFinite(hh)) return time
  return `${String(hh % 12 || 12).padStart(2, '0')}:${String(mm ?? 0).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`
}
/** The settings form keeps one opens/closes pair; the API stores it for Monday to Saturday, as the design's example reads. */
export const toOpeningHours = (opens: string, closes: string): OpeningHours => ({
  timezone: 'Africa/Lagos',
  days: [1, 2, 3, 4, 5, 6].map((day) => ({ day, intervals: [{ opens: to24h(opens), closes: to24h(closes) }] })),
})
