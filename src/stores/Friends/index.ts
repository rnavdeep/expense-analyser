import { defineStore } from 'pinia'
import FriendsService from '@/services/FriendsService'
import type { UserDto } from '@/models/UserDto'
// Define the Pinia store
export const useFriendsStore = defineStore('Friends', {
  state: () => ({}),

  actions: {
    async getUser(data: string): Promise<UserDto> {
      try {
        // Call Friends Service to fetch user
        const response = await FriendsService.GetUser(data)
        return response
      } catch (error) {
        console.error('Not found', error)
        throw new Error('Error')
      }
    },
    async sendRequest(user: UserDto): Promise<any> {
      try {
        // Call Friends Service to fetch user
        const response = await FriendsService.SendRequest(user)
        return response
      } catch (error) {
        console.error('Not found', error)
        throw new Error('Error')
      }
    },
    async acceptRequest(requestId: string): Promise<any> {
      try {
        const response = await FriendsService.AcceptRequest(requestId)
        return response
      } catch (error) {
        console.error('Not found', error)
        throw new Error('Error')
      }
    }
  },

  getters: {}
})
