import { defineStore } from 'pinia'
import ExtractService from '@/services/ExtractService'
// Define the Pinia store
export const useExtractStore = defineStore('Extract', {
  state: () => ({}),

  actions: {
    async startExpenseAnalysis(data: any): Promise<string> {
      // Ensure data is in the expected format before proceeding
      if (!data.expenseId || !data.docId) {
        throw new Error('All fields are required to run extract job.')
      }

      try {
        // Call Extract Service to create the new expense -- returns expenseId
        const response = await ExtractService.StartExpenseAnalysis(data)
        return response
      } catch (error) {
        console.error('Error running expense extract:', error)
        throw new Error('Error running expense extract')
      }
    }
  },

  getters: {}
})
