// src/services/AuthService.ts
import axios from 'axios'
import type { RegisterRequestDto } from '@/models/RegisterRequestDto' // Ensure this path is correct

const API_URL = 'http://localhost:5223/api/Auth' // Set your API URL here

class AuthService {
  async register(data: RegisterRequestDto): Promise<void> {
    try {
      const response = await axios.post(`${API_URL}/Register`, data)
      return response.data // Adjust this according to your API response
    } catch (error) {
      // Handle the error and provide a more user-friendly message
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }
}

export default new AuthService()
