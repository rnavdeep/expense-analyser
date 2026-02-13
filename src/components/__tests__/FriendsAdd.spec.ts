import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FriendsAdd from '../FriendsAdd.vue'

const friendsStoreMock = vi.hoisted(() => ({
  getUser: vi.fn().mockResolvedValue({ id: 'u1', username: 'alice' }),
  sendRequest: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/stores/Friends', () => ({ useFriendsStore: () => friendsStoreMock }))

describe('FriendsAdd.vue', () => {
  it('searches friend and sends request', async () => {
    const wrapper = shallowMount(FriendsAdd)
    ;(wrapper.vm as any).friendSearchQuery = 'alice'

    await (wrapper.vm as any).searchFriend()
    expect(friendsStoreMock.getUser).toHaveBeenCalledWith('alice')

    await (wrapper.vm as any).sendRequest({ id: 'u1', username: 'alice' })
    expect(friendsStoreMock.sendRequest).toHaveBeenCalled()
  })
})
