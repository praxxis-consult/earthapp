import { describe, it, expect, beforeEach } from 'vitest'
import { addAddress, addressLine, removeAddress, resetAddressCache, setDefaultAddress, updateAddress } from '../lib/addresses'
import type { DeliveryAddress } from '../feature/delivery/deliveryApiSlice'

const base: DeliveryAddress = { country: 'NG', region: 'Lagos', area: 'Surulere', street: '7 Adebola Street', landmark: 'Near the blue church gate', postalCode: '101283', firstName: 'Ngozi', lastName: 'Adeola', phone: '+2348179270284', email: 'gozi.adeola@example.com' }
const read = () => JSON.parse(localStorage.getItem('earth.addresses.acct') ?? '[]') as { id: string; street: string; isDefault: boolean }[]

describe('addresses', () => {
  beforeEach(() => {
    resetAddressCache()
    localStorage.clear()
  })
  it('makes the first address the default and keeps one default at a time', () => {
    const a = addAddress('acct', base)
    const b = addAddress('acct', { ...base, street: 'Herbert Macaulay Way', area: 'Yaba' })
    expect(read().map((x) => [x.street, x.isDefault])).toEqual([['7 Adebola Street', true], ['Herbert Macaulay Way', false]])
    setDefaultAddress('acct', b.id)
    expect(read().map((x) => x.isDefault)).toEqual([false, true])
    const c = addAddress('acct', { ...base, street: '22 Kwame Nkrumah Road' }, true)
    expect(read().find((x) => x.isDefault)?.id).toBe(c.id)
    expect(a.id).not.toBe(b.id)
  })
  it('edits in place and hands the default on when the default is removed', () => {
    const a = addAddress('acct', base)
    const b = addAddress('acct', { ...base, street: 'Herbert Macaulay Way' })
    updateAddress('acct', b.id, { ...base, street: 'Herbert Macaulay Way, Sabo' })
    expect(read()[1].street).toBe('Herbert Macaulay Way, Sabo')
    removeAddress('acct', a.id)
    expect(read()).toHaveLength(1)
    expect(read()[0].isDefault).toBe(true)
  })
  it('prints the list line from street, area and state', () => {
    expect(addressLine(base)).toBe('7 Adebola Street, Surulere, Lagos')
    expect(addressLine({ ...base, area: '', street: 'Plot 4' })).toBe('Plot 4, Lagos')
  })
})
