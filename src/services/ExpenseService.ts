import type { DocumentDialogDto } from '@/models/DocumentDialogDto'
import type { ExpenseListDataDto, UpdateExpenseDto } from '@/models/ExpenseCreateForm'
import axios from 'axios'

const API_URL = 'http://localhost:5223/api/Expense' // Set your API URL here

class ExpenseService {
  async CreateExpense(data: any): Promise<string> {
    try {
      const response = await axios.post(`${API_URL}/createForm`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data.id
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create expense')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  async updateExpense(id: string, updateExpenseDto: UpdateExpenseDto) {
    try {
      const response = await axios.put(`${API_URL}/updateExpense/${id}`, updateExpenseDto, {
        withCredentials: true
      })

      return response.data
    } catch (error) {
      return error
    }
  }

  async UploadExpenseDoc(data: any): Promise<DocumentDialogDto> {
    try {
      const response = await axios.post(`${API_URL}/uploadDoc`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to upload expense document')
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
  async GetDocByExpenseId(id: string): Promise<DocumentDialogDto[]> {
    try {
      const resp = await axios.get(`${API_URL}/getDocs/${id}`, {
        withCredentials: true
      })

      // Check if there's a 204 No Content response
      if (resp.status === 204) {
        return []
      }
      return resp.data as DocumentDialogDto[]
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to retrieve documents')
      }
      throw new Error('An unexpected error occurred')
    }
  }
}

export default new ExpenseService()
