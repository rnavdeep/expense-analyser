import { defineStore } from 'pinia'
import SettlementService from '@/services/SettlementService'
import type { Pagination } from '@/models/Pagination'
import type {
  BalanceDetailDto,
  CreateSettlementRequest,
  SettlementDto
} from '@/models/Settlement'

interface SettlementState {
  settlements: SettlementDto[]
  balanceDetail: BalanceDetailDto | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

export const useSettlementStore = defineStore('Settlement', {
  state: (): SettlementState => ({
    settlements: [],
    balanceDetail: null,
    isLoading: false,
    isSaving: false,
    error: null
  }),

  actions: {
    async CreateSettlement(request: CreateSettlementRequest): Promise<SettlementDto> {
      this.isSaving = true
      this.error = null
      try {
        const settlement = await SettlementService.CreateSettlement(request)
        return settlement
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to create settlement'
        throw error
      } finally {
        this.isSaving = false
      }
    },

    async LoadSettlements(pagination: Pagination): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        this.settlements = await SettlementService.GetSettlements(pagination)
      } catch (error) {
        if (error instanceof Error && error.message === '404') {
          this.settlements = []
        } else {
          this.error = error instanceof Error ? error.message : 'Failed to load settlements'
        }
      } finally {
        this.isLoading = false
      }
    },

    async LoadBalanceDetail(userId: string): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        this.balanceDetail = await SettlementService.GetBalanceDetail(userId)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load balance detail'
      } finally {
        this.isLoading = false
      }
    }
  }
})
