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
  title?: string | null
  isFriendRequest?: number | null
}

// Define the Pinia store
export const useNotificationStore = defineStore('Notifications', {
  state: () => ({
    count: 0,
    notifications: [] as NotificationDto[]
  }),

  actions: {
    async AddNotification(): Promise<void> {
      this.count++
    },

    async ResetNotifications(): Promise<void> {
      this.count = 0
    },
    async GetAllNotifications(): Promise<void> {
      const notifications = (await NotificationService.GetAllNotifications()) as NotificationDto[]
      this.notifications = notifications
      this.count = notifications.filter((notification) => notification.isRead === 0).length
    },
    async ReadAllUnreadNotifications(): Promise<void> {
      try {
        //as soon as button is clicked, remove count.
        this.count = 0
        await NotificationService.ReadAllUnreadNotifications()
        setTimeout(() => {
          this.GetAllNotifications()
        }, 5000)
      } catch (error) {
        console.log(error)
      }
    }
  },

  getters: {}
})
