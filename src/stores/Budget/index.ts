import { defineStore } from 'pinia'
import BudgetService from '@/services/BudgetService'
import type { BudgetStatusDto, UpsertBudgetRequest } from '@/models/Budget'

interface BudgetState {
  budgets: BudgetStatusDto[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

export const useBudgetStore = defineStore('Budget', {
  state: (): BudgetState => ({
    budgets: [],
    isLoading: false,
    isSaving: false,
    error: null
  }),

  getters: {
    utilization: (state) => (category: string) => {
      const budget = state.budgets.find((b) => b.category === category)
      if (!budget || budget.monthlyLimit === 0) {
        return 0
      }
      return budget.spent / budget.monthlyLimit
    }
  },

  actions: {
    async LoadBudgets(): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        this.budgets = await BudgetService.GetBudgets('month')
      } catch (error) {
        if (error instanceof Error && error.message === '404') {
          this.budgets = []
        } else {
          this.error = error instanceof Error ? error.message : 'Failed to load budgets'
        }
      } finally {
        this.isLoading = false
      }
    },

    async SaveBudget(request: UpsertBudgetRequest): Promise<void> {
      this.isSaving = true
      this.error = null
      try {
        await BudgetService.UpsertBudget(request)
        await this.LoadBudgets()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to save budget'
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async DeleteBudget(category: string): Promise<void> {
      this.isSaving = true
      this.error = null
      try {
        await BudgetService.DeleteBudget(category)
        await this.LoadBudgets()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete budget'
        throw error
      } finally {
        this.isSaving = false
      }
    }
  }
})
