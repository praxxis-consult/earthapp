/**
 * What the carrier can resolve. Shipbubble geocodes the address it is given and refuses one
 * it cannot place, and the API passes addresses through as typed. So the form holds the line:
 * a street that starts with its number and names the road, an area, a six-digit postal code,
 * and a Nigerian phone in +234 form without the domestic leading zero.
 */

const NUMBER_PREFIX = /^\s*(?:no\.?\s*|plot\s*|block\s*|house\s*|flat\s*\d+[a-z]?,?\s*|suite\s*\d+[a-z]?,?\s*|km\s*)?\d+[a-z]?/i

/**
 * "12 Admiralty Way", "Plot 7, Block C, Lekki Epe Expressway", "Flat 3, 15 Bode Thomas Street",
 * or a place the carrier knows, "Landmark Towers", "Behind Shoprite". Only what cannot be a
 * street is refused: nothing, or a number with no name after it. The carrier judges the rest.
 */
export function streetProblem(street: string): string | null {
  const s = street.trim()
  if (!s) return 'Enter the street address.'
  const rest = s.replace(NUMBER_PREFIX, '')
  if (!/[a-z]{2,}/i.test(rest)) return 'Add the road name after the number, like 12 Admiralty Way.'
  return null
}

export function areaProblem(area: string): string | null {
  const a = area.trim()
  if (!a) return 'Enter the area or town, as the carrier knows it (Lekki Phase 1, Ikeja GRA).'
  if (!/[a-z]{2,}/i.test(a)) return 'Enter the area by its name, like Lekki Phase 1.'
  return null
}

export function postalCodeProblem(code: string): string | null {
  const c = code.trim()
  if (!/^\d{6}$/.test(c)) return 'Nigerian postal codes are six digits, like 106104.'
  if (/^(\d)\1{5}$/.test(c) || c === '123456') return 'That is not a postal code the carrier knows; find yours on the NIPOST site.'
  return null
}

/**
 * Nigerian phone as the carrier wants it: +234 then ten digits. Accepts what people type
 * (0803…, 234803…, +234 803…) and answers the normalised number, or null when it cannot be one.
 */
export function nigerianPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  const national = digits.startsWith('234') ? digits.slice(3) : digits.startsWith('0') ? digits.slice(1) : digits
  return /^[1-9]\d{9}$/.test(national) ? `+234${national}` : null
}

export const phoneProblem = (input: string): string | null => (nigerianPhone(input) ? null : 'Enter a Nigerian mobile number, like 0803 123 4567 or +2348031234567.')

/** A calendar day in Lagos, `days` from `now`, as a date input wants it. */
export function lagosDay(days: number, now = Date.now()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now + days * 86_400_000))
}

/** The hour of the day in Lagos, 0 to 23. */
export function lagosHour(now = Date.now()): number {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', hourCycle: 'h23' }).format(new Date(now)))
}

/**
 * The carrier's pickup window: rate requests after 6 PM Lagos time are processed the next day,
 * and a shipment can be requested at most seven days ahead. So the earliest pickup is today
 * before six and tomorrow after it; the latest is a week from today.
 */
export const CARRIER_CUTOFF_HOUR = 18
export const earliestPickupDay = (now = Date.now()): string => lagosDay(lagosHour(now) >= CARRIER_CUTOFF_HOUR ? 1 : 0, now)
export const latestPickupDay = (now = Date.now()): string => lagosDay(7, now)

/** The carrier wants the address holder's full name: both parts, letters in each. */
export function fullNameProblem(first: string, last: string): string | null {
  if (!/[a-z]{2,}/i.test(first.trim())) return 'Enter the first name of who receives the goods.'
  if (!/[a-z]{2,}/i.test(last.trim())) return 'Enter the last name; the carrier wants the full name.'
  return null
}

/** Every check the carriers' rules impose on a delivery address (and the pickup day when one is asked), as one line per field. */
export function addressProblems(a: DeliveryAddressLike, pickupDate?: string, now = Date.now()): Record<string, string> {
  const problems: Record<string, string> = {}
  const nameIssue = fullNameProblem(a.firstName, a.lastName)
  if (nameIssue) problems[/first/.test(nameIssue) ? 'firstName' : 'lastName'] = nameIssue
  const phoneIssue = phoneProblem(a.phone)
  if (phoneIssue) problems.phone = phoneIssue
  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(a.email.trim())) problems.email = 'Enter an email for the delivery updates.'
  if (!a.region) problems.region = 'Choose the state the goods go to.'
  const areaIssue = areaProblem(a.area)
  if (areaIssue) problems.area = areaIssue
  const streetIssue = streetProblem(a.street)
  if (streetIssue) problems.street = streetIssue
  const postalIssue = postalCodeProblem(a.postalCode)
  if (postalIssue) problems.postalCode = postalIssue
  if (pickupDate !== undefined && (!pickupDate || pickupDate < earliestPickupDay(now) || pickupDate > latestPickupDay(now)))
    problems.pickupDate = lagosHour(now) >= CARRIER_CUTOFF_HOUR ? 'Carriers take requests until 6 PM Lagos time, so the earliest pickup is tomorrow; pick a day up to a week ahead.' : 'Pick a day from today to a week ahead.'
  return problems
}

/** The address as the carriers take it: trimmed, the phone in +234 form, a landmark where none was given. */
export function carrierAddress<T extends DeliveryAddressLike>(a: T): T {
  return { ...a, area: a.area.trim(), street: a.street.trim(), landmark: a.landmark.trim() || 'Not provided', postalCode: a.postalCode.trim(), firstName: a.firstName.trim(), lastName: a.lastName.trim(), phone: nigerianPhone(a.phone) ?? a.phone, email: a.email.trim() }
}

interface DeliveryAddressLike {
  region: string
  area: string
  street: string
  landmark: string
  postalCode: string
  firstName: string
  lastName: string
  phone: string
  email: string
}
