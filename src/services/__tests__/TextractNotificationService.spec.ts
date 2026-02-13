import { describe, expect, it, vi } from 'vitest'
import TextractNotificationService from '../TextractNotificationService'

const startMock = vi.fn().mockResolvedValue(undefined)
const stopMock = vi.fn().mockResolvedValue(undefined)
const onMock = vi.fn()

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: class {
    withUrl() {
      return this
    }
    build() {
      return {
        start: startMock,
        stop: stopMock,
        on: onMock
      }
    }
  }
}))

vi.mock('@/stores/Notifications', () => ({
  useNotificationStore: () => ({
    GetAllNotifications: vi.fn().mockResolvedValue(undefined)
  })
}))

describe('TextractNotificationService', () => {
  it('starts and stops hub connection', async () => {
    await TextractNotificationService.start()
    await TextractNotificationService.stop()

    expect(startMock).toHaveBeenCalled()
    expect(stopMock).toHaveBeenCalled()
    expect(onMock).toHaveBeenCalledWith('TextractNotification', expect.any(Function))
  })
})
