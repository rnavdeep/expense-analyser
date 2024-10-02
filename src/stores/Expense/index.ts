import { ExpenseDataDto } from './../../models/ExpenseCreateForm'
import { defineStore } from 'pinia'
import EncryptionService from '@/services/EncryptionService'
import ExpenseService from '@/services/ExpenseService'

// Define the interface for NewExpense
interface NewExpense {
  title: string
  description: string
  amount: string
}

// Define the Pinia store
export const useExpenseStore = defineStore('Expense', {
  state: (): NewExpense => ({
    title: '',
    description: '',
    amount: ''
  }),

  actions: {
    async createExpense(data: ExpenseDataDto) {
      try {
        // Ensure data is in the expected format before encryption
        if (!data.title || !data.description || !data.files) {
          throw new Error('All fields are required to create an expense.')
        }

        // Encrypt the expense data
        // const encryptedData = EncryptionService.encrypt(data)
        //const descrypt = EncryptionService.decrypt(encryptedData)
        // Call ExpenseService to create the new expense
        const success = await ExpenseService.CreateExpense(data)

        // Optionally handle success or response
        if (success) {
          console.log('Expense created successfully')
        } else {
          throw new Error('Failed to create expense')
        }
      } catch (error) {
        // Improve error message for clarity
        console.error('Error creating expense:', error)
        throw new Error('Failed to create expense. Please try again.')
      }
    }
  },

  getters: {}
})
