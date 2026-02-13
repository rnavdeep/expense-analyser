import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Navbar from '../Navbar.vue'

const pushMock = vi.fn()

const authStoreMock = vi.hoisted(() => ({
  isAuthenticated: true,
  isSessionActive: true,
  userName: 'alice',
  checkSession: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined)
}))

const notificationStoreMock = vi.hoisted(() => ({
  count: 2,
  ReadAllUnreadNotifications: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/stores/Auth', () => ({ useAuthStore: () => authStoreMock }))
vi.mock('@/stores/Notifications', () => ({ useNotificationStore: () => notificationStoreMock }))
vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: pushMock })
  }
})

describe('Navbar.vue', () => {
  it('logs out and routes to home', async () => {
    const wrapper = shallowMount(Navbar)

    await (wrapper.vm as any).logout()
    expect(authStoreMock.logout).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/')

    ;(wrapper.vm as any).onClickBell()
    expect(pushMock).toHaveBeenCalledWith('/notifications')
    expect(notificationStoreMock.ReadAllUnreadNotifications).toHaveBeenCalled()
  })
})
