import { defineStore } from 'pinia'
import AuthService from '@/services/AuthService'
import { LoginDataDto } from '@/models/LoginData'
import { LoginResponse } from '@/models/LoginResponse'
import { useNotificationStore } from '../Notifications'
import TextractNotificationService from '@/services/TextractNotificationService'

 AuthState {
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
    async login(data: LoginDataDto) {
      try {
        // Call AuthService to log in and get JWT token
        const resp = await AuthService.Login(data)
        this.loginResponse = new LoginResponse(resp.isLoggedIn, resp.errors)
        // Optionally set username in the state directly
        this.userName = data.username
        this.isSessionActive = resp.isLoggedIn
        //as soon as user is logged is fetch notifications
        if (resp.isLoggedIn) {
          TextractNotificationService.start()

          const notificationStore = useNotificationStore()
          notificationStore.GetAllNotifications()
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
