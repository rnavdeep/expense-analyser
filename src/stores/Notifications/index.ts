import { defineStore } from 'pinia'
import NotificationService from '@/services/NotificationService'

// Define the NotificationDto interface
interface NotificationDto {
  id: string
  createdAt: string
  readAt?: string | null
  isRead: number
  userId: string
  message: string
}

// Define the Pinia store
export const useNotificationStore = defineStore('Notifications', {
  state: () => ({
    count: 0,
    notifications: [] as NotificationDto[],
    unreadNotifications: [] as NotificationDto[],
    readNotifications: [] as NotificationDto[]
  }),

  actions: {
    async AddNotification(): Promise<void> {
      this.count++
    },

    async ResetNotifications(): Promise<void> {
      this.count = 0
    },

    async GetUnreadNotifications(): Promise<void> {
      const notifications =
        (await NotificationService.GetUnreadNotifications()) as NotificationDto[]
      this.unreadNotifications = notifications
      this.count = notifications.length
    },
    async GetReadNotifications(): Promise<void> {
      const notifications = (await NotificationService.GetReadNotifications()) as NotificationDto[]
      this.readNotifications = notifications
    },
    async GetAllNotifications(): Promise<void> {
      const notifications = (await NotificationService.GetAllNotifications()) as NotificationDto[]
      this.notifications = notifications
    },
    async ReadAllUnreadNotifications(): Promise<void> {
      try {
        await NotificationService.ReadAllUnreadNotifications()
        setTimeout(() => {
          this.GetAllNotifications()
        }, 10000)
      } catch (error) {
        console.log(error)
      }
    }
  },

  getters: {}
})
