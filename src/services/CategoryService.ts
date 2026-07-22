import axios from 'axios'
import type { CategoryDto, CategoryStatusDto, CategoryExpenseDto, UpsertCategoryRequest } from '@/models/Category'

const BASE_URL = import.meta.env.VITE_APP_API_URL

class CategoryService {
  /**
   * @param request name and monthlyLimit to upsert
   * @returns the upserted CategoryDto
   */
  async UpsertCategory(request: UpsertCategoryRequest): Promise<CategoryDto> {
    try {
      const response = await axios.put(`${BASE_URL}/Category`, request, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to save category')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   * @param period currently only 'month' is supported
   * @returns categories with their spend for the period
   */
  async GetCategories(period: 'month'): Promise<CategoryStatusDto[]> {
    try {
      const response = await axios.get(`${BASE_URL}/Category`, {
        params: { period },
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('404')
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch categories')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   * @param id the category's id
   */
  async DeleteCategory(id: string): Promise<void> {
    try {
      await axios.delete(`${BASE_URL}/Category/${id}`, { withCredentials: true })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete category')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   * @param name the category to preview linked expenses for
   * @returns up to 5 most recent expenses this month in that category
   */
  async GetCategoryExpenses(name: string): Promise<CategoryExpenseDto[]> {
    try {
      const response = await axios.get(`${BASE_URL}/Category/${encodeURIComponent(name)}/expenses`, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to load category expenses')
      }
      throw new Error('An unexpected error occurred')
    }
  }
}

export default new CategoryService()
