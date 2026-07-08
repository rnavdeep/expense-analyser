import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Pagination } from '@/models/Pagination'
import { useSettlementStore } from '@/stores/Settlement'

vi.mock('@/services/SettlementService', () => ({
  default: {
    CreateSettlement: vi.fn(),
    GetSettlements: vi.fn(),
    GetBalanceDetail: vi.fn()
  }
}))

import SettlementService from '@/services/SettlementService'

const CreateSettlement = SettlementService.CreateSettlement as ReturnType<typeof vi.fn>
const GetSettlements = SettlementService.GetSettlements as ReturnType<typeof vi.fn>
const GetBalanceDetail = SettlementService.GetBalanceDetail as ReturnType<typeof vi.fn>

const settlement = {
  id: 's1',
  payerUserId: 'me',
  payerUserName: 'Me',
  payeeUserId: 'u1',
  payeeUserName: 'Sam',
  amount: 20,
  note: null,
  createdAt: '2026-07-08T00:00:00Z'
}

describe('Settlement store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('CreateSettlement sets isSaving and returns the created settlement', async () => {
    CreateSettlement.mockResolvedValue(settlement)
    const store = useSettlementStore()

    const result = await store.CreateSettlement({ payeeUserId: 'u1', amount: 20 })

    expect(result).toEqual(settlement)
    expect(store.isSaving).toBe(false)
    expect(store.error).toBeNull()
  })

  it('CreateSettlement captures the error and rethrows', async () => {
    CreateSettlement.mockRejectedValue(new Error('boom'))
    const store = useSettlementStore()

    await expect(store.CreateSettlement({ payeeUserId: 'u1', amount: 20 })).rejects.toThrow(
      'boom'
    )
    expect(store.error).toBe('boom')
    expect(store.isSaving).toBe(false)
  })

  it('LoadSettlements populates the list on success', async () => {
    GetSettlements.mockResolvedValue([settlement])
    const store = useSettlementStore()

    await store.LoadSettlements(new Pagination(1, 10))

    expect(store.settlements).toEqual([settlement])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('LoadSettlements swallows a 404 into an empty list', async () => {
    GetSettlements.mockRejectedValue(new Error('404'))
    const store = useSettlementStore()

    await store.LoadSettlements(new Pagination(1, 10))

    expect(store.settlements).toEqual([])
    expect(store.error).toBeNull()
  })

  it('LoadSettlements captures other errors', async () => {
    GetSettlements.mockRejectedValue(new Error('boom'))
    const store = useSettlementStore()

    await store.LoadSettlements(new Pagination(1, 10))

    expect(store.error).toBe('boom')
  })

  it('LoadBalanceDetail populates the detail on success', async () => {
    const detail = { userId: 'u1', userName: 'Sam', netAmount: 20, direction: 'youOwe', entries: [] }
    GetBalanceDetail.mockResolvedValue(detail)
    const store = useSettlementStore()

    await store.LoadBalanceDetail('u1')

    expect(store.balanceDetail).toEqual(detail)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('LoadBalanceDetail captures the error', async () => {
    GetBalanceDetail.mockRejectedValue(new Error('boom'))
    const store = useSettlementStore()

    await store.LoadBalanceDetail('u1')

    expect(store.error).toBe('boom')
  })
})
