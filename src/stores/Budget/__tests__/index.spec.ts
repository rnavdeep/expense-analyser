import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBudgetStore } from '@/stores/Budget'

vi.mock('@/services/BudgetService', () => ({
  default: {
    UpsertBudget: vi.fn(),
    GetBudgets: vi.fn(),
    DeleteBudget: vi.fn()
  }
}))

import BudgetService from '@/services/BudgetService'

const UpsertBudget = BudgetService.UpsertBudget as ReturnType<typeof vi.fn>
const GetBudgets = BudgetService.GetBudgets as ReturnType<typeof vi.fn>
const DeleteBudget = BudgetService.DeleteBudget as ReturnType<typeof vi.fn>

const budget = { category: 'Groceries', monthlyLimit: 300, spent: 120 }

describe('Budget store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('LoadBudgets populates the list on success', async () => {
    GetBudgets.mockResolvedValue([budget])
    const store = useBudgetStore()

    await store.LoadBudgets()

    expect(store.budgets).toEqual([budget])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('LoadBudgets swallows a 404 into an empty list', async () => {
    GetBudgets.mockRejectedValue(new Error('404'))
    const store = useBudgetStore()

    await store.LoadBudgets()

    expect(store.budgets).toEqual([])
    expect(store.error).toBeNull()
  })

  it('LoadBudgets captures other errors', async () => {
    GetBudgets.mockRejectedValue(new Error('boom'))
    const store = useBudgetStore()

    await store.LoadBudgets()

    expect(store.error).toBe('boom')
  })

  it('SaveBudget upserts then reloads the budgets', async () => {
    UpsertBudget.mockResolvedValue({ id: 'b1', category: 'Groceries', monthlyLimit: 300 })
    GetBudgets.mockResolvedValue([budget])
    const store = useBudgetStore()

    await store.SaveBudget({ category: 'Groceries', monthlyLimit: 300 })

    expect(UpsertBudget).toHaveBeenCalledWith({ category: 'Groceries', monthlyLimit: 300 })
    expect(store.budgets).toEqual([budget])
    expect(store.isSaving).toBe(false)
    expect(store.error).toBeNull()
  })

  it('SaveBudget captures the error and rethrows', async () => {
    UpsertBudget.mockRejectedValue(new Error('boom'))
    const store = useBudgetStore()

    await expect(store.SaveBudget({ category: 'Groceries', monthlyLimit: 300 })).rejects.toThrow(
      'boom'
    )
    expect(store.error).toBe('boom')
    expect(store.isSaving).toBe(false)
  })

  it('DeleteBudget deletes then reloads the budgets', async () => {
    DeleteBudget.mockResolvedValue(undefined)
    GetBudgets.mockResolvedValue([])
    const store = useBudgetStore()

    await store.DeleteBudget('Groceries')

    expect(DeleteBudget).toHaveBeenCalledWith('Groceries')
    expect(store.budgets).toEqual([])
    expect(store.isSaving).toBe(false)
    expect(store.error).toBeNull()
  })

  it('DeleteBudget captures the error and rethrows', async () => {
    DeleteBudget.mockRejectedValue(new Error('boom'))
    const store = useBudgetStore()

    await expect(store.DeleteBudget('Groceries')).rejects.toThrow('boom')
    expect(store.error).toBe('boom')
    expect(store.isSaving).toBe(false)
  })

  it('utilization returns spent/monthlyLimit for a known category', () => {
    const store = useBudgetStore()
    store.budgets = [budget]

    expect(store.utilization('Groceries')).toBe(120 / 300)
  })

  it('utilization guards against divide-by-zero and unknown categories', () => {
    const store = useBudgetStore()
    store.budgets = [{ category: 'Rent', monthlyLimit: 0, spent: 50 }]

    expect(store.utilization('Rent')).toBe(0)
    expect(store.utilization('Unknown')).toBe(0)
  })
})
