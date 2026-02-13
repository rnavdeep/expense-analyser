import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Example:
// import { useAuthStore } from '@/stores/Auth'
// import AuthService from '@/services/AuthService'

describe('StoreName', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('updates state on successful action', async () => {
    // vi.spyOn(AuthService, 'Login').mockResolvedValue({ isLoggedIn: true, errors: '' })
    // const store = useAuthStore()
    // await store.login({ username: 'u', password: 'p' } as any)
    // expect(store.isAuthenticated).toBe(true)
    expect(true).toBe(true)
  })
})
