import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Notifications from '../Notifications.vue'

const notificationStoreMock = vi.hoisted(() => ({
  notifications: [],
  GetAllNotifications: vi.fn().mockResolvedValue(undefined)
}))

const friendsStoreMock = vi.hoisted(() => ({
  acceptRequest: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/stores/Notifications', () => ({ useNotificationStore: () => notificationStoreMock }))
vi.mock('@/stores/Friends', () => ({ useFriendsStore: () => friendsStoreMock }))

describe('Notifications.vue', () => {
  it('loads notifications and accepts request', async () => {
    const wrapper = shallowMount(Notifications)
    await flushPromises()

    expect(notificationStoreMock.GetAllNotifications).toHaveBeenCalled()

    await (wrapper.vm as any).acceptRequest('req-1')
    expect(friendsStoreMock.acceptRequest).toHaveBeenCalledWith('req-1')
  })
})
