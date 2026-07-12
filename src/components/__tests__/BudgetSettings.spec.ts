import { flushPromises, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BudgetSettings from '../BudgetSettings.vue'
import { useDashboardStore } from '@/stores/Dashboard'
import type { DashboardData } from '@/models/Dashboard'

vi.mock('@/services/BudgetService', () => ({
  default: { GetBudgets: vi.fn(), UpsertBudget: vi.fn() }
}))

import BudgetService from '@/services/BudgetService'

const GetBudgets = BudgetService.GetBudgets as ReturnType<typeof vi.fn>
const UpsertBudget = BudgetService.UpsertBudget as ReturnType<typeof vi.fn>

const budgets = [
  { category: 'Food', monthlyLimit: 300, spent: 120 },
  { category: 'Travel', monthlyLimit: 200, spent: 50 }
]

const mountSettings = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = shallowMount(BudgetSettings, { global: { plugins: [pinia] } })
  await flushPromises()
  return wrapper
}

describe('BudgetSettings.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and renders budget rows from the store', async () => {
    GetBudgets.mockResolvedValue(budgets)
    const wrapper = await mountSettings()

    expect(GetBudgets).toHaveBeenCalledWith('month')

    const rows = wrapper.findAll('.budget-row')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('Food')
    expect(rows[0].text()).toContain('$120.00 of $300.00 spent')
  })

  it('shows an empty state when there are no budgets', async () => {
    GetBudgets.mockResolvedValue([])
    const wrapper = await mountSettings()
    expect(wrapper.text()).toContain('No budgets yet')
  })

  it('shows a loading spinner before budgets resolve', async () => {
    GetBudgets.mockReturnValue(new Promise(() => {}))
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = shallowMount(BudgetSettings, { global: { plugins: [pinia] } })
    await flushPromises()
    expect((wrapper.vm as any).isLoading).toBe(true)
    expect(wrapper.findAll('.budget-row')).toHaveLength(0)
  })

  it('shows an error state when loading fails', async () => {
    GetBudgets.mockRejectedValue(new Error('boom'))
    const wrapper = await mountSettings()
    expect((wrapper.vm as any).error).toBe('boom')
  })

  it('save calls SaveBudget with the edited monthly limit', async () => {
    GetBudgets.mockResolvedValue(budgets)
    UpsertBudget.mockResolvedValue({ id: 'b1', category: 'Food', monthlyLimit: 350 })
    const wrapper = await mountSettings()

    const vm = wrapper.vm as any
    vm.rows[0].monthlyLimit = 350
    await vm.save(vm.rows[0])

    expect(UpsertBudget).toHaveBeenCalledWith({ category: 'Food', monthlyLimit: 350 })
  })

  it('seeds the category combobox from dashboard categories minus existing budgets', async () => {
    GetBudgets.mockResolvedValue(budgets)
    const pinia = createPinia()
    setActivePinia(pinia)
    const dashboardStore = useDashboardStore()
    const data: DashboardData = {
      kpis: {
        totalSpent: 0,
        youOwe: 0,
        owedToYou: 0,
        receiptsScanned: 0,
        totalSpentDelta: 0,
        youOweSubtext: '',
        owedToYouSubtext: '',
        receiptsSubtext: ''
      },
      monthly: [],
      categories: [
        { label: 'Food', amount: 0, color: '#000' },
        { label: 'Utilities', amount: 0, color: '#000' }
      ],
      recent: [],
      balances: { youOwe: [], owedToYou: [] }
    }
    dashboardStore.data = data

    const wrapper = shallowMount(BudgetSettings, { global: { plugins: [pinia] } })
    await flushPromises()

    expect((wrapper.vm as any).categoryOptions).toEqual(['Utilities'])
  })

  it('addBudget saves the new category and resets the form', async () => {
    GetBudgets.mockResolvedValue(budgets)
    UpsertBudget.mockResolvedValue({ id: 'b3', category: 'Fun', monthlyLimit: 100 })
    const wrapper = await mountSettings()

    const vm = wrapper.vm as any
    vm.newCategory = 'Fun'
    vm.newLimit = 100
    await vm.addBudget()

    expect(UpsertBudget).toHaveBeenCalledWith({ category: 'Fun', monthlyLimit: 100 })
    expect(vm.newCategory).toBe('')
    expect(vm.newLimit).toBeNull()
  })

  it('does not add a budget when the form is incomplete', async () => {
    GetBudgets.mockResolvedValue(budgets)
    const wrapper = await mountSettings()

    const vm = wrapper.vm as any
    vm.newCategory = ''
    vm.newLimit = 100
    await vm.addBudget()

    expect(UpsertBudget).not.toHaveBeenCalled()
  })
})
