import { describe, it, expect } from 'vitest'
import { describeError } from '../app/api/problem'

const problem = (status: number, type: string, title = '') => ({ status, data: { type, title, status } })

describe('describeError', () => {
  it('names the bank check when the API reports it unavailable', () => {
    const msg = describeError(problem(503, 'https://earth.example/problems/banks/unavailable', 'Bank verification is briefly unavailable.'))
    expect(msg).toMatch(/^Bank verification is briefly unavailable/)
  })
  it('keeps the generic line for any other outage', () => {
    expect(describeError(problem(503, 'https://earth.example/problems/shipping/unavailable'))).toBe('Earth is having trouble right now. Please try again shortly.')
    expect(describeError(problem(500, ''))).toBe('Earth is having trouble right now. Please try again shortly.')
  })
  it('reads the problem code for the known cases', () => {
    expect(describeError(problem(400, 'https://earth.example/problems/auth/code-invalid'))).toMatch(/invalid or has expired/)
    expect(describeError(problem(409, 'https://earth.example/problems/accounts/exists'))).toMatch(/already exists/)
    expect(describeError({ status: 'FETCH_ERROR', error: 'TypeError' })).toMatch(/could not reach Earth/)
  })
})
