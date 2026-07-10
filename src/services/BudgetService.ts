import axios from 'axios'
import type { BudgetDto, BudgetStatusDto, UpsertBudgetRequest } from '@/models/Budget'

const BASE_URL = import.meta.env.VITE_APP_API_URL

class BudgetService {
  /**
   * @param request category and monthlyLimit to upsert
   * @returns the upserted BudgetDto
   */
  async UpsertBudget(request: UpsertBudgetRequest): Promise<BudgetDto> {
    try {
      const response = await axios.put(`${BASE_URL}/Budget`, request, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to save budget')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   * @param period currently only 'month' is supported
   * @returns budgets with their spend for the period
   */
  async GetBudgets(period: 'month'): Promise<BudgetStatusDto[]> {
    try {
      const response = await axios.get(`${BASE_URL}/Budget`, {
        params: { period },
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('404')
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch budgets')
      }
      throw new Error('An unexpected error occurred')
    }
  }
}

export default new BudgetService()
