import { describe, it, expect } from 'vitest'
import { areaProblem, nigerianPhone, phoneProblem, postalCodeProblem, streetProblem } from '../lib/address'

describe('what the carrier can place', () => {
  it('wants a street that starts with its number and names the road', () => {
    expect(streetProblem('12 Admiralty Way')).toBeNull()
    expect(streetProblem('No. 4B Ogunlana Drive, Surulere')).toBeNull()
    expect(streetProblem('Plot 7, Block C, Lekki Epe Expressway')).toBeNull()
    expect(streetProblem('102 Lekki Epe Express Road')).toBeNull()
    expect(streetProblem('')).toMatch(/Enter/)
    expect(streetProblem('Landmark Towers')).toBeNull()
    expect(streetProblem('akpolo street')).toBeNull()
    expect(streetProblem('Marina')).toMatch(/house or plot number/)
    expect(streetProblem('1,')).toMatch(/road name/)
    expect(streetProblem('12')).toMatch(/road name/)
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
