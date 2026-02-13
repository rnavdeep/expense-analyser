import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginDataDto } from '@/models/LoginData'

const {
  loginMock,
  checkSessionMock,
  logoutMock,
  notificationFetchMock,
  textractStartMock
} = vi.hoisted(() => ({
  loginMock: vi.fn(),
  checkSessionMock: vi.fn(),
  logoutMock: vi.fn(),
  notificationFetchMock: vi.fn(),
  textractStartMock: vi.fn()
}))

vi.mock('@/services/AuthService', () => ({
  default: {
    Login: loginMock,
    checkSession: checkSessionMock,
    Logout: logoutMock
  }
}))

vi.mock('@/stores/Notifications', () => ({
  useNotificationStore: () => ({
    GetAllNotifications: notificationFetchMock
  })
}))

vi.mock('@/services/TextractNotificationService', () => ({
  default: {
    start: textractStartMock
  }
}))

import { useAuthStore } from '@/stores/Auth'

describe('Auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('login updates state and triggers notifications when authenticated', async () => {
    loginMock.mockResolvedValue({ isLoggedIn: true, errors: '' })
    const store = useAuthStore()

    await store.login(new LoginDataDto('alice', 'password'))

    expect(store.isAuthenticated).toBe(true)
    expect(store.userName).toBe('alice')
    expect(textractStartMock).toHaveBeenCalledTimes(1)
    expect(notificationFetchMock).toHaveBeenCalledTimes(1)
  })

  it('login throws user-friendly error when service fails', async () => {
    loginMock.mockRejectedValue(new Error('network issue'))
    const store = useAuthStore()

    await expect(store.login(new LoginDataDto('alice', 'password'))).rejects.toThrow(
      'Login failed. Please check your credentials.'
    )
  })

  it('checkSession syncs auth state from service', async () => {
    checkSessionMock.mockResolvedValue({ isLoggedIn: true, userName: 'bob' })
    const store = useAuthStore()

    await store.checkSession()

    expect(store.isAuthenticated).toBe(true)
    expect(store.userName).toBe('bob')
  })

  it('logout clears auth state', async () => {
    logoutMock.mockResolvedValue(undefined)
    const store = useAuthStore()
    store.isSessionActive = true
    store.userName = 'demo'

    await store.logout()

    expect(logoutMock).toHaveBeenCalledTimes(1)
    expect(store.isAuthenticated).toBe(false)
    expect(store.userName).toBe('')
  })
})
