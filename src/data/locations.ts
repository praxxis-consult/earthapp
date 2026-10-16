import { allCountries } from 'country-region-data'

/**
 * Where a store can be: every country and its first-level divisions (ISO 3166-1 / 3166-2) from
 * the open `country-region-data` set (MIT). The API narrows the public catalogue by a country
 * code and a region string (`GET /stores?country=&region=`), so a seller is only findable by
 * region when theirs is spelled the way the catalogue is asked for it: the onboarding region
 * picker and the marketplace's location filter both read this list, so they agree.
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
