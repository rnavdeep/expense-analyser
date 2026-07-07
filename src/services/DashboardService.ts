import axios from 'axios'
import type {
  BalancesDto,
  DashboardPeriod,
  MonthlySpendingDto,
  SummaryDto
} from '@/models/Dashboard'

const BASE_URL = import.meta.env.VITE_APP_API_URL
const API_URL = BASE_URL + '/Expense'

class DashboardService {
  /**
   * @param period month | quarter | year
   * @returns DashboardSummaryDto — totals, delta and per-category breakdown
   */
  async GetSummary(period: DashboardPeriod): Promise<SummaryDto> {
    try {
      const response = await axios.get(`${API_URL}/summary`, {
        params: { period },
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch dashboard summary')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   * @param months number of trailing months to include (gap months are 0)
   * @returns chronological list of monthly spend totals
   */
  async GetMonthly(months: number): Promise<MonthlySpendingDto[]> {
    try {
      const response = await axios.get(`${API_URL}/monthly`, {
        params: { months },
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch monthly spending')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   * @returns outstanding balances grouped by counterparty (you owe / owed to you)
   */
  async GetBalances(): Promise<BalancesDto> {
    try {
      const response = await axios.get(`${API_URL}/balances`, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch balances')
      }
      throw new Error('An unexpected error occurred')
    }
  }
}

export default new DashboardService()
