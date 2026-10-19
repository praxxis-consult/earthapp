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
