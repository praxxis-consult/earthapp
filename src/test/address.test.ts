import { describe, it, expect } from 'vitest'
import { areaProblem, earliestPickupDay, fullNameProblem, lagosHour, latestPickupDay, nigerianPhone, phoneProblem, postalCodeProblem, streetProblem } from '../lib/address'

describe('what the carrier can place', () => {
  it('wants a street that starts with its number and names the road', () => {
    expect(streetProblem('12 Admiralty Way')).toBeNull()
    expect(streetProblem('No. 4B Ogunlana Drive, Surulere')).toBeNull()
    expect(streetProblem('Plot 7, Block C, Lekki Epe Expressway')).toBeNull()
    expect(streetProblem('102 Lekki Epe Express Road')).toBeNull()
    expect(streetProblem('')).toMatch(/Enter/)
    expect(streetProblem('Landmark Towers')).toBeNull()
    expect(streetProblem('Flat 3, 15 Bode Thomas Street')).toBeNull()
    expect(streetProblem('Km 12 Lekki-Epe Expressway')).toBeNull()
    expect(streetProblem('Behind Shoprite, Ikeja')).toBeNull()
    expect(streetProblem('akpolo street')).toBeNull()
    expect(streetProblem('Marina')).toBeNull()
    expect(streetProblem('1, akpolo street')).toBeNull()
    expect(streetProblem('1,')).toMatch(/road name/)
    expect(streetProblem('12')).toMatch(/road name/)
    expect(streetProblem('No. 5')).toMatch(/road name/)
  })
  it('wants an area by name and a real six-digit postal code', () => {
    expect(areaProblem('Lekki Phase 1')).toBeNull()
    expect(areaProblem('')).toMatch(/area/)
    expect(areaProblem('12')).toMatch(/name/)
    expect(postalCodeProblem('106104')).toBeNull()
    expect(postalCodeProblem('10610')).toMatch(/six digits/)
    expect(postalCodeProblem('111111')).toMatch(/NIPOST/)
    expect(postalCodeProblem('123456')).toMatch(/NIPOST/)
  })
  it('normalises a Nigerian phone to +234 without the leading zero', () => {
    expect(nigerianPhone('0803 123 4567')).toBe('+2348031234567')
    expect(nigerianPhone('+234 803 123 4567')).toBe('+2348031234567')
    expect(nigerianPhone('2348031234567')).toBe('+2348031234567')
    expect(nigerianPhone('+2340803123456')).toBeNull()
    expect(nigerianPhone('803123')).toBeNull()
    expect(phoneProblem('0803 123 4567')).toBeNull()
    expect(phoneProblem('+44 7700 900123')).toMatch(/Nigerian/)
  })
})

describe('the carrier’s pickup window', () => {
  it('starts today before 6 PM Lagos time and tomorrow after, and ends a week out', () => {
    const noon = Date.parse('2026-10-19T11:00:00Z') // 12:00 in Lagos (UTC+1)
    const evening = Date.parse('2026-10-19T17:30:00Z') // 18:30 in Lagos
    expect(lagosHour(noon)).toBe(12)
    expect(lagosHour(evening)).toBe(18)
    expect(earliestPickupDay(noon)).toBe('2026-10-19')
    expect(earliestPickupDay(evening)).toBe('2026-10-20')
    expect(latestPickupDay(noon)).toBe('2026-10-26')
    // 23:30 UTC is 00:30 the next day in Lagos: that day, before the cutoff
    expect(earliestPickupDay(Date.parse('2026-10-19T23:30:00Z'))).toBe('2026-10-20')
  })
  it('wants both parts of the name', () => {
    expect(fullNameProblem('Ogagaoghene', 'Akpolo')).toBeNull()
    expect(fullNameProblem('', 'Akpolo')).toMatch(/first name/)
    expect(fullNameProblem('Ogagaoghene', ' ')).toMatch(/last name/)
  })
})
