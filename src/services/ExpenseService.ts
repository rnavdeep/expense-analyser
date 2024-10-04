import type { ExpenseListDataDto } from '@/models/ExpenseCreateForm'
import axios from 'axios'

const API_URL = 'http://localhost:5223/api/Expense' // Set your API URL here

class ExpenseService {
  async CreateExpense(data: any): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/createForm`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.status === 200
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create expense')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  async GetExpenses(): Promise<ExpenseListDataDto[]> {
    try {
      const response = await axios.get(`${API_URL}/myExpenses`, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create expense')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  async DeleteExpense(expense: ExpenseListDataDto): Promise<any> {
    try {
      const resp = await axios.delete(`${API_URL}/${expense.id}`, {
        withCredentials: true
      })
      return resp.status == 204
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create expense')
      }
      throw new Error('An unexpected error occurred')
    }
  }
}

export default new ExpenseService()
