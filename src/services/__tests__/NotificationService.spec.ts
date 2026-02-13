import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
import NotificationService from '../NotificationService'

vi.mock('axios')

describe('NotificationService', () => {
  it('GetAllNotifications returns notifications', async () => {
    ;(axios as any).get = vi.fn().mockResolvedValue({ data: [{ id: 'n1' }] })

    const result = await NotificationService.GetAllNotifications()

    expect(result).toHaveLength(1)
  })

  it('ReadAllUnreadNotifications posts readAll endpoint', async () => {
    ;(axios as any).post = vi.fn().mockResolvedValue({})

    await NotificationService.ReadAllUnreadNotifications()

    expect((axios as any).post).toHaveBeenCalledWith(
      expect.stringContaining('/Notification/readAll'),
      null,
      expect.objectContaining({ withCredentials: true })
    )
  })
})
