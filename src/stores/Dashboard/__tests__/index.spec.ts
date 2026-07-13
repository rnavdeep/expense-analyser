import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboardStore } from '@/stores/Dashboard'

vi.mock('@/services/DashboardService', () => ({
  default: {
    GetSummary: vi.fn(),
    GetMonthly: vi.fn(),
    GetBalances: vi.fn()
  }
}))
vi.mock('@/services/ExpenseService', () => ({
  default: { GetExpenses: vi.fn() }
}))
vi.mock('@/services/BudgetService', () => ({
  default: { GetBudgets: vi.fn() }
}))

import DashboardService from '@/services/DashboardService'
import ExpenseService from '@/services/ExpenseService'
import BudgetService from '@/services/BudgetService'

const summary = {
  totalSpent: 100,
  receiptsScanned: 2,
  youOwe: 60,
  owedToYou: 40,
  totalSpentDeltaPct: 12.5,
  categories: [
    { category: 'Travel', amount: 60 },
    { category: 'Food', amount: 40 }
  ]
}
const monthly = [
  { year: 2026, month: 6, label: 'Jun', amount: 80 },
  { year: 2026, month: 7, label: 'Jul', amount: 100 }
]
const balances = {
  youOwe: [{ userId: 'u1', userName: 'Sam', amount: 60 }],
  owedToYou: [
    { userId: 'u2', userName: 'Jordan', amount: 40 },
    { userId: 'u3', userName: 'Pat', amount: 10 }
  ]
}
const recent = {
  expenses: [{ id: '1', title: 'Cab', description: 'ride', amount: 100, createdAt: '2026-07-04' }],
  totalRows: 1
}
const budgets = [{ category: 'Travel', monthlyLimit: 200, spent: 60 }]

const GetSummary = DashboardService.GetSummary as ReturnType<typeof vi.fn>
const GetMonthly = DashboardService.GetMonthly as ReturnType<typeof vi.fn>
const GetBalances = DashboardService.GetBalances as ReturnType<typeof vi.fn>
const GetExpenses = ExpenseService.GetExpenses as ReturnType<typeof vi.fn>
const GetBudgets = BudgetService.GetBudgets as ReturnType<typeof vi.fn>

describe('Dashboard store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    GetSummary.mockResolvedValue(summary)
    GetMonthly.mockResolvedValue(monthly)
    GetBalances.mockResolvedValue(balances)
    GetExpenses.mockResolvedValue(recent)
    GetBudgets.mockResolvedValue(budgets)
  })

  it('LoadDashboard maps API DTOs into the UI shape', async () => {
    const store = useDashboardStore()

    await store.LoadDashboard('month')

    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    const d = store.data!

    // KPI mapping: delta rename + subtexts derived from balance counts
    expect(d.kpis.totalSpent).toBe(100)
    expect(d.kpis.totalSpentDelta).toBe(12.5)
    expect(d.kpis.youOweSubtext).toBe('across 1 person')
    expect(d.kpis.owedToYouSubtext).toBe('from 2 people')
    expect(d.kpis.receiptsSubtext).toBe('this month')

    // categories: label from `category`, distinct color assigned by index
    expect(d.categories[0]).toMatchObject({ label: 'Travel', amount: 60 })
    expect(d.categories[0].color).toBeTruthy()
    expect(d.categories[1].color).not.toBe(d.categories[0].color)

    // monthly + balances name mapping
    expect(d.monthly).toEqual([
      { label: 'Jun', amount: 80 },
      { label: 'Jul', amount: 100 }
    ])
    expect(d.balances.youOwe[0]).toEqual({ userId: 'u1', name: 'Sam', amount: 60 })
    expect(d.recent).toHaveLength(1)
    expect(d.budgets).toEqual(budgets)
  })

  it('requests a 12-month window for the year period', async () => {
    const store = useDashboardStore()

    await store.LoadDashboard('year')

    expect(GetMonthly).toHaveBeenCalledWith(12)
    expect(store.data!.kpis.receiptsSubtext).toBe('this year')
  })

  it('tolerates a failing recent-expenses call (empty recent, no error)', async () => {
    GetExpenses.mockRejectedValueOnce(new Error('404'))
    const store = useDashboardStore()

    await store.LoadDashboard('month')

    expect(store.error).toBeNull()
    expect(store.data!.recent).toEqual([])
  })

  it('tolerates a failing budgets call (empty budgets, no error)', async () => {
    GetBudgets.mockRejectedValueOnce(new Error('404'))
    const store = useDashboardStore()

    await store.LoadDashboard('month')

    expect(store.error).toBeNull()
    expect(store.data!.budgets).toEqual([])
  })

  it('captures the error when a summary call fails', async () => {
    GetSummary.mockRejectedValueOnce(new Error('boom'))
    const store = useDashboardStore()

    await store.LoadDashboard('month')

    expect(store.error).toBe('boom')
    expect(store.isLoading).toBe(false)
  })
})
