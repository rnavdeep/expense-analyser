import type { DocumentDialogDto } from '@/models/DocumentDialogDto'
import type { ExpenseListDataDto } from '@/models/ExpenseCreateForm'
import axios from 'axios'

const API_URL = 'http://localhost:5223/api/Document' // Set your API URL here

class DocumentService {
  async DeleteDocument(docId: string): Promise<any> {
    try {
      const resp = await axios.delete(`${API_URL}/${docId}`, {
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

export default new DocumentService()
