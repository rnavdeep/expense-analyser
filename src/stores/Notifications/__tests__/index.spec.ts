import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotificationStore } from '@/stores/Notifications'

const getAllNotificationsMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue([
    { id: 'n1', isRead: 0 },
    { id: 'n2', isRead: 1 }
  ])
)

vi.mock('@/services/NotificationService', () => ({
  default: {
    GetAllNotifications: getAllNotificationsMock,
    ReadAllUnreadNotifications: vi.fn().mockResolvedValue(undefined)
  }
}))

describe('Notifications store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('GetAllNotifications sets notifications and unread count', async () => {
    const store = useNotificationStore()

    await store.GetAllNotifications()

    expect(getAllNotificationsMock).toHaveBeenCalled()
    expect(store.notifications).toHaveLength(2)
    expect(store.count).toBe(1)
  })
})
