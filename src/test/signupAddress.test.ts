import { describe, it, expect, beforeEach } from 'vitest'
import { forgetSignupAddress, rememberSignupAddress, signupAddress } from '../lib/signupAddress'

describe('sign-up address', () => {
  beforeEach(() => forgetSignupAddress())
  it('offers the account’s draft when this device kept nothing', () => {
    expect(signupAddress({ address: '12 Bode Thomas Street, Surulere, Lagos', landmark: 'Opposite the big red mosque' })).toEqual({ street: '12 Bode Thomas Street, Surulere, Lagos', landmark: 'Opposite the big red mosque', area: '', region: '', postalCode: '' })
    expect(signupAddress(null)).toEqual({ street: '', landmark: '', area: '', region: '', postalCode: '' })
    expect(signupAddress({ address: null, landmark: 'By the gate' }).street).toBe('')
  })
  it('prefers what this device kept, which has the map pin’s pieces', () => {
    rememberSignupAddress({ street: '12 Bode Thomas Street', landmark: '', area: 'Surulere', region: 'Lagos', postalCode: '101283' })
    expect(signupAddress({ address: '12 Bode Thomas Street, Surulere, Lagos', landmark: 'x' })).toMatchObject({ street: '12 Bode Thomas Street', area: 'Surulere', region: 'Lagos', postalCode: '101283' })
    forgetSignupAddress()
    expect(signupAddress({ address: 'a', landmark: 'b' }).street).toBe('a')
  })
})
