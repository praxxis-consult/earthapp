import { regionsOf } from '../data/locations'

/** What a map pin resolves to, in the delivery address's own fields; anything the map does not know is ''. */
export interface GeoAddress {
  street: string
  area: string
  region: string
  postalCode: string
  /** A named place at the pin (a bus stop, a shop) that reads as a landmark. */
  landmark: string
  /** The geocoder's own one-line reading, for showing under the map. */
  line: string
}

/** The fields Nominatim's `addressdetails=1` answer may carry (a subset). */
export interface NominatimAddress {
  house_number?: string
  road?: string
  neighbourhood?: string
  residential?: string
  hamlet?: string
  village?: string
  suburb?: string
  quarter?: string
  city_district?: string
  district?: string
  town?: string
  city?: string
  county?: string
  state?: string
  postcode?: string
  amenity?: string
  shop?: string
  building?: string
  highway?: string
  office?: string
  country_code?: string
}

/** The app's state name for what the geocoder calls it ("Lagos State" → "Lagos", "Federal Capital Territory" → the Abuja entry). */
export function regionFor(state: string | undefined, country = 'NG'): string {
  if (!state) return ''
  const wanted = state.replace(/\s+state$/i, '').trim().toLowerCase()
  const regions = regionsOf(country)
  return regions.find((r) => r.toLowerCase() === wanted) ?? regions.find((r) => r.toLowerCase().includes(wanted) || wanted.includes(r.toLowerCase())) ?? ''
}

/** The delivery address a Nominatim reverse answer gives, as the carriers' fields. */
export function fromNominatim(address: NominatimAddress, displayName = ''): GeoAddress {
  const street = [address.house_number, address.road].filter(Boolean).join(' ').trim()
  // The area as a carrier knows it: the neighbourhood or suburb first, then the town or city.
  const area = address.neighbourhood || address.residential || address.suburb || address.quarter || address.hamlet || address.village || address.city_district || address.district || address.town || address.city || address.county || ''
  const postalCode = /^\d{6}$/.test(address.postcode ?? '') ? address.postcode! : ''
  const landmark = address.amenity || address.shop || address.building || address.highway || address.office || ''
  return { street, area, region: regionFor(address.state, address.country_code?.toUpperCase() || 'NG'), postalCode, landmark, line: displayName }
}

const ENDPOINT = 'https://nominatim.openstreetmap.org/reverse'

/**
 * Turns a map pin into an address with OpenStreetMap's Nominatim (free; one request a second
 * at most, which the map picker's debounce respects, and the browser sends the page's origin as
 * the referer it asks for). Coverage in Nigeria is uneven: the pin fills what the map knows and
 * the person corrects the rest. A geocoder on Earth's own API replaces this the day it exists.
 */
export async function reverseGeocode(lat: number, lon: number, signal?: AbortSignal): Promise<GeoAddress> {
  const url = `${ENDPOINT}?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=en`
  const res = await fetch(url, { signal, headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`The map service answered ${res.status}.`)
  const data = (await res.json()) as { address?: NominatimAddress; display_name?: string; error?: string }
  if (data.error || !data.address) throw new Error('Nothing is known about that spot on the map.')
  if (data.address.country_code && data.address.country_code !== 'ng') throw new Error('Earth delivers within Nigeria only; pick a spot in Nigeria.')
  return fromNominatim(data.address, data.display_name)
}
