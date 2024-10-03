import { ExpenseDataDto } from './../../models/ExpenseCreateForm'
import { defineStore } from 'pinia'
import ExpenseService from '@/services/ExpenseService'

// Define the interface for NewExpense
interface NewExpense {
  title: string
  description: string
  amount: string
  isUploading: boolean
  uploadSuccess: boolean | null
}

// Define the Pinia store
export const useExpenseStore = defineStore('Expense', {
  state: (): NewExpense => ({
    title: '',
    description: '',
    amount: '',
    isUploading: false,
    uploadSuccess: null
  }),

  actions: {
    async createExpense(data: ExpenseDataDto) {
      // Ensure data is in the expected format before encryption
      if (!data.title || !data.description || !data.files) {
        throw new Error('All fields are required to create an expense.')
      }

      try {
        this.isUploading = true
        // Call ExpenseService to create the new expense
        const resp = await ExpenseService.CreateExpense(data)

        if (resp) {
          this.uploadSuccess = true
        }
      } catch (error) {
        this.uploadSuccess = false
      } finally {
        this.isUploading = false
      }
    }
  },

  getters: {
    isExpenseUploading: (state) => state.isUploading, // Check if expense is being created
    isExpenseUploaded: (state) => state.uploadSuccess
  }
})
