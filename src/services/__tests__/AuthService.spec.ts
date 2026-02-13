import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import AuthService from '../AuthService'
import { LoginDataDto } from '@/models/LoginData'

vi.mock('axios')

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Login maps successful response', async () => {
    const mockedAxios = axios as any
    mockedAxios.post = vi.fn().mockResolvedValue({
      data: { isLoggedIn: true, error: '' }
    })

    const resp = await AuthService.Login(new LoginDataDto('user', 'pass'))

    expect(resp.isLoggedIn).toBe(true)
    expect(resp.errors).toBe('')
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/Login'),
      expect.anything(),
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('Login maps error payload from rejected response', async () => {
    const mockedAxios = axios as any
    mockedAxios.post = vi.fn().mockRejectedValue({
      response: {
        data: { isLoggedIn: false, error: 'Invalid credentials' }
      }
    })

    const resp = await AuthService.Login(new LoginDataDto('user', 'wrong'))

    expect(resp.isLoggedIn).toBe(false)
    expect(resp.errors).toBe('Invalid credentials')
  })

  it('checkSession returns session values on success', async () => {
    const mockedAxios = axios as any
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: { isLoggedIn: true, userName: 'alice' }
    })

    const resp = await AuthService.checkSession()

    expect(resp.isLoggedIn).toBe(true)
    expect(resp.userName).toBe('alice')
  })

  it('checkSession returns logged-out session on failure', async () => {
    const mockedAxios = axios as any
    mockedAxios.get = vi.fn().mockRejectedValue(new Error('request failed'))

    const resp = await AuthService.checkSession()

    expect(resp.isLoggedIn).toBe(false)
    expect(resp.userName).toBe('')
  })
})
