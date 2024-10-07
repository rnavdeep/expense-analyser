import { ExpenseDataDto, ExpenseListDataDto } from './../../models/ExpenseCreateForm'
import { defineStore } from 'pinia'
import ExpenseService from '@/services/ExpenseService'
import type { DocumentDialogDto } from '@/models/DocumentDialogDto'

// Define the interface for NewExpense
interface NewExpense {
  expenseId: string | null
  title: string
  description: string
  amount: string
  isUploading: boolean
  uploadSuccess: boolean | null
  dialogUploadDocs: boolean
}

// Define the Pinia store
export const useExpenseStore = defineStore('Expense', {
  state: (): NewExpense => ({
    expenseId: null,
    title: '',
    description: '',
    amount: '',
    isUploading: false,
    uploadSuccess: null,
    dialogUploadDocs: false
  }),

  actions: {
    async createExpense(data: ExpenseDataDto): Promise<any> {
      // Ensure data is in the expected format before proceeding
      if (!data.title || !data.description || !data.files) {
        throw new Error('All fields are required to create an expense.')
      }

      try {
        this.isUploading = true
        // Call ExpenseService to create the new expense -- returns expenseId
        const response = await ExpenseService.CreateExpense(data)
        this.expenseId = response
        return response
      } catch (error) {
        this.uploadSuccess = false
        console.error('Error creating expense:', error)
      } finally {
        this.isUploading = false
      }
    },
    async uploadExpenseDoc(data: any) {
      // Ensure data is in the expected format before encryption
      if (!data.id || !data.file) {
        throw new Error('All fields are required to upload an expense document.')
      }

      try {
        this.isUploading = true
        // Call ExpenseService to create the new expense
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
