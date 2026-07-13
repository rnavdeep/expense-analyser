import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'
import FriendsList from '../FriendsList.vue'

const friendsStoreMock = vi.hoisted(() => ({
  getFriends: vi.fn().mockResolvedValue([{ userId: 'u1', username: 'alice' }])
}))

vi.mock('@/stores/Friends', () => ({ useFriendsStore: () => friendsStoreMock }))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/balances/:userId', component: { template: '<div />' } }
  ]
})

describe('FriendsList.vue', () => {
  it('loads friends list in async setup', async () => {
    const wrapper = mount(
      {
        template: '<Suspense><FriendsList /></Suspense>',
        components: { FriendsList }
      },
      { global: { plugins: [router] } }
    )

    await flushPromises()
    expect(friendsStoreMock.getFriends).toHaveBeenCalled()
    expect(wrapper.exists()).toBe(true)
  })

  it('links each friend row to their balance detail page', async () => {
    const wrapper = mount(
      {
        template: '<Suspense><FriendsList /></Suspense>',
        components: { FriendsList }
      },
      { global: { plugins: [router] } }
    )

    await flushPromises()
    const row = wrapper.find('.friend-row')
    expect(row.attributes('href')).toBe('/balances/u1')
  })
})
