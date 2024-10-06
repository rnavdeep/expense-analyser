import { ExpenseDataDto, ExpenseListDataDto } from './../../models/ExpenseCreateForm'
import { defineStore } from 'pinia'
import ExpenseService from '@/services/ExpenseService'
import type { DocumentDialogDto } from '@/models/DocumentDialogDto'

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
        } else {
          throw new Error('Unsuccessful')
        }
      } catch (error) {
        this.uploadSuccess = false
      } finally {
        this.isUploading = false
      }
    },
    async GetExpenses(): Promise<ExpenseListDataDto[]> {
      try {
        const resp = await ExpenseService.GetExpenses()
        return resp
      } catch (error) {
        console.log('Error loading expenses')
        throw new Error('Failed')
      }
    },
    async DeleteExpense(expense: ExpenseListDataDto): Promise<any> {
      try {
        return await ExpenseService.DeleteExpense(expense)
      } catch (error) {
        console.log('Error loading expenses')
        throw new Error('Failed')
      }
    },
    async GetDocByExpenseId(expenseId: string): Promise<DocumentDialogDto[]> {
      try {
        const resp = await ExpenseService.GetDocByExpenseId(expenseId)
        return resp as DocumentDialogDto[]
      } catch (error) {
        console.log('Error loading expenses')
        throw new Error('Failed')
      }
    }
  },

  getters: {}
})
