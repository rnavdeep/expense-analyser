// src/services/AuthService.ts
import { LoginDataDto } from '@/models/LoginData'
import { LoginResponse } from '@/models/LoginResponse'
import type { RegisterRequestDto } from '@/models/RegisterData'
import { SessionData } from '@/models/SessionData'
import axios from 'axios'
const BASE_URL = import.meta.env.VITE_APP_API_URL
const API_URL = BASE_URL + '/auth'
class AuthService {
  async Register(data: RegisterRequestDto): Promise<void> {
    try {
      const response = await axios.post(`${API_URL}/Register`, data, { withCredentials: true })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  async Login(data: LoginDataDto): Promise<LoginResponse> {
    const result = new LoginResponse(false, '')
    await axios
      .post(`${API_URL}/Login`, data, {
        withCredentials: true
      })
      .then((response) => {
        result.isLoggedIn = response.data.isLoggedIn
        result.errors = response.data.error
      })
      .catch((error) => {
        result.isLoggedIn = error.response.data.isLoggedIn
        result.errors = error.response.data.error
      })
    return result
  }
  async Logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/Logout`, {}, { withCredentials: true })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  async checkSession(): Promise<SessionData> {
    const result = new SessionData('', false)
    await axios
      .get(`${API_URL}/checkSession`, { withCredentials: true })
      .then((response) => {
        result.isLoggedIn = response.data.isLoggedIn
        result.userName = response.data.userName
      })
      .catch((error) => {
        result.userName = ''
        result.isLoggedIn = false
      })
    return result
  }
}

export default new AuthService()
