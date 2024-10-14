import { defineStore } from 'pinia'
// Define the Pinia store
export const useNotificationStore = defineStore('Notifications', {
  state: () => ({
    count: 0
  }),
  actions: {
    async AddNotification(): Promise<void> {
      this.count++
    },
    async ResetNotifications(): Promise<void> {
      this.count = 0
    }
  },

  getters: {}
})
