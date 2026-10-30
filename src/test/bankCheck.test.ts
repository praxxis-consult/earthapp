import { describe, expect, it } from 'vitest'
import { checkFailure } from '../feature/banks/useAccountCheck'

describe('checkFailure', () => {
  it('tells the seller to try again when the lookup itself is the problem', () => {
    for (const status of [404, 429, 501, 503]) expect(checkFailure({ status, message: 'x' })).toEqual({ status: 'unavailable' })
  })
  it('says no such account when the provider rejects the number', () => {
    for (const status of [400, 422])
      expect(checkFailure({ status, message: 'Account not found' })).toEqual({ status: 'failed', message: 'The bank could not find an account with that number.' })
  })
  it('passes any other problem through in the API’s words', () => {
    expect(checkFailure({ status: 500, message: 'Something broke' })).toEqual({ status: 'failed', message: 'Something broke' })
    expect(checkFailure({ message: 'Network down' })).toEqual({ status: 'failed', message: 'Network down' })
  })
})
