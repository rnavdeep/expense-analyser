import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
import FriendsService from '../FriendsService'

vi.mock('axios')

describe('FriendsService', () => {
  it('GetUser returns data when status is 200', async () => {
    ;(axios as any).get = vi.fn().mockResolvedValue({ status: 200, data: { id: 'u1' } })

    const user = await FriendsService.GetUser('alice')

    expect(user.id).toBe('u1')
  })

  it('GetFriends returns list', async () => {
    ;(axios as any).get = vi.fn().mockResolvedValue({ status: 200, data: [{ id: 'u1' }] })

    const list = await FriendsService.GetFriends()

    expect(list).toHaveLength(1)
  })
})
