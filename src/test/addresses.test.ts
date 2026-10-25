import { describe, it, expect } from 'vitest'
import { addressLine, flatten, replacementFor, type SavedAddress } from '../lib/addresses'
import type { ApiAddress } from '../feature/accounts/addressesApiSlice'

const address = { country: 'NG' as const, region: 'Lagos', area: 'Surulere', street: '7 Adebola Street', landmark: 'Near the blue church gate', postalCode: '101283', firstName: 'Ngozi', lastName: 'Adeola', phone: '+2348179270284', email: 'gozi.adeola@example.com' }
const api = (id: string, isDefault: boolean, patch: Partial<typeof address> = {}): ApiAddress => ({ id, version: 2, label: null, address: { ...address, ...patch }, isDefault, createdAt: '2026-10-25T00:00:00Z', updatedAt: '2026-10-25T00:00:00Z' })

describe('addresses', () => {
  it('flattens the API record to the fields the pages read, keeping id, version and the default flag', () => {
    const a: SavedAddress = flatten(api('a1', true))
    expect(a).toMatchObject({ id: 'a1', version: 2, isDefault: true, street: '7 Adebola Street', region: 'Lagos', country: 'NG' })
  })
  it('names the first remaining address as the replacement only when the default is removed', () => {
    const list = [flatten(api('a1', true)), flatten(api('a2', false, { street: 'Herbert Macaulay Way' })), flatten(api('a3', false))]
    expect(replacementFor(list, 'a1')).toBe('a2')
    expect(replacementFor(list, 'a2')).toBeUndefined()
    expect(replacementFor([list[0]], 'a1')).toBeUndefined()
  })
  it('prints the list line from street, area and state', () => {
    expect(addressLine(address)).toBe('7 Adebola Street, Surulere, Lagos')
    expect(addressLine({ ...address, area: '', street: 'Plot 4' })).toBe('Plot 4, Lagos')
  })
})
