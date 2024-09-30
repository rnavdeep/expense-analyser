// src/services/AuthService.ts
import axios from 'axios'
const API_URL = 'http://localhost:5223/api/Auth' // Set your API URL here

class AuthService {
  async Register(data: any): Promise<void> {
    try {
      const response = await axios.post(`${API_URL}/Register`, { data })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  async Login(data: any): Promise<void> {
    try {
      const response = await axios.post(`${API_URL}/Login`, { data })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed')
      }
      throw new Error('An unexpected error occurred')
    }
  }
}

export default new AuthService()
