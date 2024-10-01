import { defineStore } from 'pinia'
import AuthService from '@/services/AuthService'
import EncryptionService from '@/services/EncryptionService'
import { LoginDataDto } from '@/models/LoginData'
interface AuthState {
  token: string | null
  userName: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('jwtToken'),
    userName: localStorage.getItem('userName')
  }),

  actions: {
    async login(username: string, password: string) {
      try {
        // Encrypt login data
        const loginDataDto = new LoginDataDto(username, password)
        const encryptedData = EncryptionService.encrypt(loginDataDto)
        // Call AuthService to log in

        const tokenLogin = await AuthService.Login(encryptedData)
        localStorage.setItem('jwtToken', tokenLogin)
        localStorage.setItem('userName', username)
        this.token = tokenLogin
        this.userName = username

        // Store the token in localStorage and state
      } catch (error) {
        throw new Error('Login failed. Please check your credentials.')
      }
    },

    logout() {
      this.token = null
      this.userName = null
      localStorage.removeItem('jwtToken')
      localStorage.removeItem('userName')
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.token // Check if user is authenticated
  }
})
