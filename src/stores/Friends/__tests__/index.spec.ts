import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFriendsStore } from '@/stores/Friends'

const getUserMock = vi.hoisted(() => vi.fn().mockResolvedValue({ id: 'u1' }))

vi.mock('@/services/FriendsService', () => ({
  default: {
    GetUser: getUserMock,
    SendRequest: vi.fn().mockResolvedValue(undefined),
    AcceptRequest: vi.fn().mockResolvedValue(undefined),
    GetFriends: vi.fn().mockResolvedValue([]),
    GetDropdownUsers: vi.fn().mockResolvedValue([])
  }
}))

describe('Friends store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('getUser delegates to service', async () => {
    const store = useFriendsStore()

    const user = await store.getUser('alice')

    expect(getUserMock).toHaveBeenCalledWith('alice')
    expect((user as any).id).toBe('u1')
  })
})
