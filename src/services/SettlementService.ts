import axios from 'axios'
import type { Pagination } from '@/models/Pagination'
import type {
  BalanceDetailDto,
  CreateSettlementRequest,
  SettlementDto
} from '@/models/Settlement'

const BASE_URL = import.meta.env.VITE_APP_API_URL

class SettlementService {
  /**
   * @param request payeeUserId, amount and an optional note
   * @returns the created SettlementDto
   */
  async CreateSettlement(request: CreateSettlementRequest): Promise<SettlementDto> {
    try {
      const response = await axios.post(`${BASE_URL}/Settlement`, request, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create settlement')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   * @param pagination pageNumber/pageSize
   * @returns settlements newest first
   */
  async GetSettlements(pagination: Pagination): Promise<SettlementDto[]> {
    try {
      const response = await axios.get(`${BASE_URL}/Settlement`, {
        params: {
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize
        },
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('404')
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch settlements')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   * @param userId counterparty user id
   * @returns net balance and chronological entries with that user
   */
  async GetBalanceDetail(userId: string): Promise<BalanceDetailDto> {
    try {
      const response = await axios.get(`${BASE_URL}/Expense/balances/${userId}`, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch balance detail')
      }
      throw new Error('An unexpected error occurred')
    }
  }
}

export default new SettlementService()
