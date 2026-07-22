import { defineStore } from 'pinia'
import CategoryService from '@/services/CategoryService'
import type { CategoryStatusDto, UpsertCategoryRequest } from '@/models/Category'

interface CategoryState {
  categories: CategoryStatusDto[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

export const useCategoryStore = defineStore('Category', {
  state: (): CategoryState => ({
    categories: [],
    isLoading: false,
    isSaving: false,
    error: null
  }),

  getters: {
    utilization: (state) => (name: string) => {
      const category = state.categories.find((c) => c.name === name)
      if (!category || category.monthlyLimit === 0) {
        return 0
      }
      return category.spent / category.monthlyLimit
    }
  },

  actions: {
    async LoadCategories(): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        this.categories = await CategoryService.GetCategories('month')
      } catch (error) {
        if (error instanceof Error && error.message === '404') {
          this.categories = []
        } else {
          this.error = error instanceof Error ? error.message : 'Failed to load categories'
        }
      } finally {
        this.isLoading = false
      }
    },

    async SaveCategory(request: UpsertCategoryRequest): Promise<void> {
      this.isSaving = true
      this.error = null
      try {
        await CategoryService.UpsertCategory(request)
        await this.LoadCategories()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to save category'
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async DeleteCategory(id: string): Promise<void> {
      this.isSaving = true
      this.error = null
      try {
        await CategoryService.DeleteCategory(id)
        await this.LoadCategories()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to delete category'
        throw error
      } finally {
        this.isSaving = false
      }
    }
  }
})
