import axios from 'axios'
const BASE_URL = import.meta.env.VITE_APP_API_URL

const API_URL = BASE_URL + '/Textract' // Set your API URL here

class ExtractService {
  /**
   *
   * @param data : (string expenseId, string docId)
   * @returns : jobId of the job started and monitored in background
   */
  async StartExpenseAnalysis(data: any): Promise<string> {
    try {
      const response = await axios.post(
        `${API_URL}/expense/${data.expenseId}/doc/${data.docId}`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      return response.data.jobId
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create expense')
      }
      throw new Error('An unexpected error occurred')
    }
  }
}

export default new ExtractService()
