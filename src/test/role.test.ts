import { describe, it, expect } from 'vitest'
import { canBuy, canSell, buyerOnly, landingFor } from '../feature/authentication/role'
import type { Account } from '../services/earthApi'

const account = (accountType: Account['accountType']): Account => ({
  id: 'a1',
  accountType,
  firstName: 'Ada',
  lastName: 'Obi',
  email: 'ada@example.com',
  phoneNumber: null,
  status: 'CONFIRMED',
  confirmedAt: '2026-10-18T00:00:00Z',
})

describe('account roles', () => {
  it('a buying account never sells, a selling one never buys, BOTH does both', () => {
    expect(canSell(account('BUYING'))).toBe(false)
    expect(canBuy(account('BUYING'))).toBe(true)
    expect(canSell(account('SELLING'))).toBe(true)
    expect(canBuy(account('SELLING'))).toBe(false)
    expect(canSell(account('BOTH'))).toBe(true)
    expect(canBuy(account('BOTH'))).toBe(true)
    expect(buyerOnly(account('BUYING'))).toBe(true)
    expect(buyerOnly(account('BOTH'))).toBe(false)
    expect(buyerOnly(null)).toBe(false)
  })
})

describe('landingFor', () => {
  it('sends a buyer to the dashboard without asking for a store', async () => {
    let asked = 0
    const to = await landingFor(account('BUYING'), async () => {
      asked += 1
      return null
    })
    expect(to).toBe('/dashboard')
    expect(asked).toBe(0)
  })
  it('sends a seller to onboarding until the store is live, then to the dashboard', async () => {
    expect(await landingFor(account('SELLING'), async () => null)).toBe('/onboarding/store')
    expect(await landingFor(account('SELLING'), async () => 'DRAFT')).toBe('/onboarding/store')
    expect(await landingFor(account('BOTH'), async () => 'LIVE')).toBe('/dashboard')
    // the store call failing (403, network) reads as "no store yet", never a crash
    expect(await landingFor(account('SELLING'), async () => { throw new Error('503') })).toBe('/onboarding/store')
  })
  it('honours the page that asked for the sign-in, whoever signs in', async () => {
    expect(await landingFor(account('BUYING'), async () => null, '/marketplace/p1/order')).toBe('/marketplace/p1/order')
    expect(await landingFor(account('SELLING'), async () => null, '/marketplace/p1')).toBe('/marketplace/p1')
  })
})
