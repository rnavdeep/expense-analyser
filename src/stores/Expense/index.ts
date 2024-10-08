import { defineStore } from 'pinia'
import ExpenseService from '@/services/ExpenseService'
import {
  ExpenseDataDto,
  ExpenseListDataDto,
  type UpdateExpenseDto
} from '@/models/ExpenseCreateForm'
import type { DocumentDialogDto } from '@/models/DocumentDialogDto'

// Define the interface for NewExpense
interface NewExpense {
  expenseId: string | null
  title: string
  description: string
  amount: string
  isUploading: boolean
  uploadSuccess: boolean
  dialogUploadDocs: boolean
  isUpdating: boolean
  isUpdateSuccessful: boolean
  expenses: ExpenseListDataDto[]
  isPageLoading: boolean
}

// Define the Pinia store
export const useExpenseStore = defineStore('Expense', {
  state: (): NewExpense => ({
    expenseId: null,
    title: '',
    description: '',
    amount: '',
    isUploading: false,
    uploadSuccess: false,
    dialogUploadDocs: false,
    isUpdating: false,
    isUpdateSuccessful: false,
    expenses: [],
    isPageLoading: true
  }),

  actions: {
    async createExpense(data: ExpenseDataDto): Promise<any> {
      // Ensure data is in the expected format before proceeding
      if (!data.title || !data.description) {
        throw new Error('All fields are required to create an expense.')
      }

      try {
        this.isUploading = true
        // Call ExpenseService to create the new expense -- returns expenseId
        const response = await ExpenseService.CreateExpense(data)
        this.expenseId = response
        this.uploadSuccess = true

        await this.GetExpenses()

        this.isUploading = false
        return response
      } catch (error) {
        this.uploadSuccess = false
        console.error('Error creating expense:', error)
      }
    },

    async updateExpense(id: string, data: UpdateExpenseDto): Promise<any> {
      // Ensure data is in the expected format before proceeding
      if (!data.title || !data.description || !id) {
        throw new Error('All fields are required to update an expense.')
      }
      try {
        this.isUpdating = true
        const response = await ExpenseService.updateExpense(id, data)
        this.isUpdating = false
        this.isUpdateSuccessful = true

        // Update the specific expense in the `expenses` list
        const index = this.expenses.findIndex((exp) => exp.id === id)
        if (index !== -1) {
          this.expenses[index] = { ...this.expenses[index], ...data }
        }

        return response
      } catch (error) {
        this.isUpdateSuccessful = false
        console.error('Error updating expense:', error)
      }
    },

    async uploadExpenseDoc(data: any) {
      // Ensure data is in the expected format before encryption
      if (!data.id || !data.file) {
        throw new Error('All fields are required to upload an expense document.')
      }

      try {
        this.isUploading = true
        const resp = await ExpenseService.UploadExpenseDoc(data)

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

    async GetExpenses(): Promise<void> {
      try {
        const resp = await ExpenseService.GetExpenses()
        this.expenses = resp
        this.isPageLoading = false
      } catch (error) {
        this.isPageLoading = false
        throw new Error('Failed to load expenses')
      }
    },

    async DeleteExpense(expense: ExpenseListDataDto): Promise<any> {
      try {
        const response = await ExpenseService.DeleteExpense(expense)
        // After deleting, fetch the updated list of expenses
        await this.GetExpenses()
        return response
      } catch (error) {
        console.log('Error deleting expense')
        throw new Error('Failed to delete expense')
      }
    },

    async GetDocByExpenseId(expenseId: string): Promise<DocumentDialogDto[]> {
      try {
        const resp = await ExpenseService.GetDocByExpenseId(expenseId)
        return resp as DocumentDialogDto[]
      } catch (error) {
        console.log('Error loading expense documents')
        throw new Error('Failed to load documents')
      }
    }
  },

  getters: {
    getExpenseById: (state) => (id: string) => {
      return state.expenses.find((expense) => expense.id === id)
    }
  }
})
