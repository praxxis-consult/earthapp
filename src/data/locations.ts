import { allCountries } from 'country-region-data'

/**
 * Where a store can be: every country and its first-level divisions (ISO 3166-1 / 3166-2) from
 * the open `country-region-data` set (MIT). The API keys the public catalogue on a country code
 * and a region string (`GET /stores?country=&region=`, both required), so a seller is only
 * findable when their region is spelled the way the catalogue is asked for it: the onboarding
 * region picker and the marketplace's location filter both read this list, so they agree.
 */

export interface Country {
  code: string
  name: string
  regions: string[]
}

/** The set names a few countries the long official way; people look for the short one. */
const SHORT_NAMES: Record<string, string> = {
  CG: 'Congo (Brazzaville)',
  CD: 'Congo (Kinshasa)',
  CI: "Côte d'Ivoire",
  GM: 'The Gambia',
  IR: 'Iran',
  KP: 'North Korea',
  KR: 'South Korea',
  MK: 'North Macedonia',
  FM: 'Micronesia',
  TZ: 'Tanzania',
  VE: 'Venezuela',
  VG: 'British Virgin Islands',
  VI: 'U.S. Virgin Islands',
}

export const COUNTRIES: Country[] = allCountries
  .map(([name, code, regions]) => ({ code, name: SHORT_NAMES[code] ?? name, regions: regions.map(([r]) => r) }))
  .sort((a, b) => a.name.localeCompare(b.name))

export const COUNTRY_NAMES = COUNTRIES.map((c) => c.name)
export const countryCode = (name: string) => COUNTRIES.find((c) => c.name === name)?.code ?? ''
export const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name ?? code
export const regionsOf = (code: string) => COUNTRIES.find((c) => c.code === code)?.regions ?? []

/**
 * The countries the marketplace sweeps for "Location: Global". The API has no unfiltered store
 * listing, so "everywhere" has to be asked for one (country, region) pair at a time; all 4,387
 * regions on earth is not a page load, so the sweep covers the markets the product launches in
 * (the onboarding design's country list) and any other country on demand when a visitor picks
 * it. An unfiltered `GET /stores` on the API replaces this list with one call.
 */
export const LAUNCH_COUNTRIES = ['NG', 'GH', 'KE', 'ZA', 'ET', 'TZ', 'CM', 'CI', 'SN', 'UG']
export const GLOBAL_PLACES = LAUNCH_COUNTRIES.flatMap((country) => regionsOf(country).map((region) => ({ country, region })))
