import { describe, it, expect } from 'vitest'
import { fromNominatim, regionFor } from '../lib/geocode'

describe('map pin to address', () => {
  it('maps the geocoder’s state names onto the app’s', () => {
    expect(regionFor('Lagos State')).toBe('Lagos')
    expect(regionFor('Delta State')).toBe('Delta')
    expect(regionFor('Federal Capital Territory')).toMatch(/Abuja|Federal Capital Territory/)
    expect(regionFor(undefined)).toBe('')
  })
  it('reads a Lekki answer into street, area, state and postal code', () => {
    const a = fromNominatim({ road: 'Victoria Arobieke Street', suburb: 'Ikate', town: 'Lekki Phase I', county: 'Eti Osa', state: 'Lagos State', postcode: '101244', country_code: 'ng' }, 'Victoria Arobieke Street, Ikate, Lekki Phase I, Eti Osa, Lagos State, 101244, Nigeria')
    expect(a).toMatchObject({ street: 'Victoria Arobieke Street', area: 'Ikate', region: 'Lagos', postalCode: '101244', landmark: '' })
  })
  it('keeps what a sparse answer gives and names a place as the landmark', () => {
    expect(fromNominatim({ hamlet: 'Mechanic Village', town: 'Oleh', county: 'Isoko South', state: 'Delta State', country_code: 'ng' })).toMatchObject({ street: '', area: 'Mechanic Village', region: 'Delta', postalCode: '' })
    expect(fromNominatim({ highway: 'Eagle Square Bus Stop', road: 'Ahmadu Bello Way', district: 'Central Business District', state: 'Federal Capital Territory', postcode: '223140', country_code: 'ng' })).toMatchObject({ street: 'Ahmadu Bello Way', area: 'Central Business District', postalCode: '223140', landmark: 'Eagle Square Bus Stop' })
    // a postcode that is not six digits is not one the carriers take
    expect(fromNominatim({ road: 'X', state: 'Lagos State', postcode: '1012' }).postalCode).toBe('')
  })
})
