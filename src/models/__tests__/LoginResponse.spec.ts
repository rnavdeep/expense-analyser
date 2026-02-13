import { describe, expect, it } from 'vitest'
import { LoginResponse } from '../LoginResponse'

describe('LoginResponse', () => {
  it('stores constructor values', () => {
    const response = new LoginResponse(true, '')

    expect(response.isLoggedIn).toBe(true)
    expect(response.errors).toBe('')
  })
})
