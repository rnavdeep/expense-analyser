import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FriendsList from '../FriendsList.vue'

const friendsStoreMock = vi.hoisted(() => ({
  getFriends: vi.fn().mockResolvedValue([{ id: 'u1', username: 'alice' }])
}))

vi.mock('@/stores/Friends', () => ({ useFriendsStore: () => friendsStoreMock }))

describe('FriendsList.vue', () => {
  it('loads friends list in async setup', async () => {
    const wrapper = mount({
      template: '<Suspense><FriendsList /></Suspense>',
      components: { FriendsList }
    })

    await flushPromises()
    expect(friendsStoreMock.getFriends).toHaveBeenCalled()
    expect(wrapper.exists()).toBe(true)
  })
})
