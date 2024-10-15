import { defineStore } from 'pinia'
import AuthService from '@/services/AuthService'
import EncryptionService from '@/services/EncryptionService'
import { LoginDataDto } from '@/models/LoginData'
import { LoginResponse } from '@/models/LoginResponse'
import { useNotificationStore } from '../Notifications'

interface AuthState {
  userName: string
  isSessionActive: boolean
  loginResponse: LoginResponse
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    userName: '',
    isSessionActive: false,
    loginResponse: new LoginResponse(false, '')
  }),

  actions: {
    async login(username: string, password: string) {
      try {
        const encryptedData = EncryptionService.encrypt(new LoginDataDto(username, password))
        // const decryptedData = EncryptionService.decrypt(encryptedData)
        // Call AuthService to log in and get JWT token
        const resp = await AuthService.Login(encryptedData)
        this.loginResponse = new LoginResponse(resp.isLoggedIn, resp.errors)
        // Optionally set username in the state directly
        this.userName = username
        this.isSessionActive = resp.isLoggedIn
        if (resp.isLoggedIn) {
          const notificationStore = useNotificationStore()
          notificationStore.GetAllNotifications()
          notificationStore.GetUnreadNotifications()
          notificationStore.GetReadNotifications()
        }
      } catch (error) {
        throw new Error('Login failed. Please check your credentials.')
      }
    },

    async checkSession() {
      try {
        //call check session
        const session = await AuthService.checkSession()

        // Check if session is still valid, update the state accordingly
        this.isSessionActive = session.isLoggedIn
        this.userName = session.userName
      } catch (error) {
        this.logout() // If an error occurs, assume the session is invalid
      }
    },

    async logout() {
      await AuthService.Logout()
      this.userName = ''
      this.isSessionActive = false
    }
  },

  getters: {
    isAuthenticated: (state) => state.isSessionActive // Check if user is authenticated
  }
})
