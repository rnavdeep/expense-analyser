import axios from 'axios'
const BASE_URL = import.meta.env.VITE_APP_API_URL

const API_URL = BASE_URL + '/Document' // Set your API URL here

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
