import { defineStore } from 'pinia'
import FriendsService from '@/services/FriendsService'
import type { UserDto } from '@/models/UserDto'
import type { FriendDto } from '@/models/FriendsDto'
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
    },
    async getFriends(): Promise<FriendDto[]> {
      try {
        const response = await FriendsService.GetFriends()
        return response as FriendDto[]
      } catch (error) {
        console.error('Not found', error)
        throw new Error('Error')
      }
    },
    async getDropdownUsers(): Promise<UserDto[]> {
      try {
        const response = await FriendsService.GetDropdownUsers()
        return response as UserDto[]
      } catch (error) {
        console.error('Not found', error)
        throw new Error('Error')
      }
    }
  },

  getters: {}
})
