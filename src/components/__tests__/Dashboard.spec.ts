import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Dashboard from '../Dashboard.vue'
import { ExpenseListDataDto } from '@/models/ExpenseCreateForm'

const authStoreMock = vi.hoisted(() => ({
  userName: 'alex'
}))

vi.mock('@/stores/Auth', () => ({
  useAuthStore: () => authStoreMock
}))

// Mock the services the Dashboard store calls so nothing hits the network.
vi.mock('@/services/DashboardService', () => ({
  default: { GetSummary: vi.fn(), GetMonthly: vi.fn(), GetBalances: vi.fn() }
}))
vi.mock('@/services/ExpenseService', () => ({
  default: { GetExpenses: vi.fn() }
}))

import DashboardService from '@/services/DashboardService'
import ExpenseService from '@/services/ExpenseService'

const summary = {
  totalSpent: 100,
  receiptsScanned: 2,
  youOwe: 60,
  owedToYou: 40,
  totalSpentDeltaPct: 12.5,
  categories: [{ category: 'Travel', amount: 100 }]
}
const monthly = [{ year: 2026, month: 7, label: 'Jul', amount: 100 }]
const balances = {
  youOwe: [{ userId: 'u1', userName: 'Sam', amount: 60 }],
  owedToYou: [{ userId: 'u2', userName: 'Jordan', amount: 40 }]
}
const recent = {
  expenses: [
    new ExpenseListDataDto('1', 'Cab', 'ride', 100, '2026-07-04'),
    new ExpenseListDataDto('2', 'Food', 'lunch', 20, '2026-07-03'),
    new ExpenseListDataDto('3', 'Hotel', 'stay', 200, '2026-07-02'),
    new ExpenseListDataDto('4', 'Gas', 'fuel', 50, '2026-07-01')
  ],
  totalRows: 4
}

// Stub the chart wrappers / vuetify pieces so nothing renders canvas in jsdom.
const stubs = {
  MonthlyBarChart: { template: '<div class="stub-bar" />' },
  CategoryDonut: { template: '<div class="stub-donut" />' },
  'router-link': { template: '<a :href="to"><slot /></a>', props: ['to'] },
  'v-icon': { template: '<i><slot /></i>' },
  'v-progress-circular': { template: '<div class="stub-spinner" />' }
}

const mountDashboard = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = mount(Dashboard, { global: { plugins: [pinia], stubs } })
  await flushPromises() // let onMounted -> LoadDashboard resolve
  return wrapper
}

describe('Dashboard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(DashboardService.GetSummary as any).mockResolvedValue(summary)
    ;(DashboardService.GetMonthly as any).mockResolvedValue(monthly)
    ;(DashboardService.GetBalances as any).mockResolvedValue(balances)
    ;(ExpenseService.GetExpenses as any).mockResolvedValue(recent)
  })

  it('greets the authenticated user by name', async () => {
    const wrapper = await mountDashboard()
    expect(wrapper.text()).toContain('alex')
    expect(wrapper.find('.dash-greeting').text()).toMatch(/Good (morning|afternoon|evening), alex/)
  })

  it('renders the four KPI cards from store data', async () => {
    const wrapper = await mountDashboard()
    const cards = wrapper.findAll('.kpi-card')
    expect(cards).toHaveLength(4)
    const text = wrapper.text()
    expect(text).toContain('Total spent')
    expect(text).toContain('You owe')
    expect(text).toContain('Owed to you')
    expect(text).toContain('Receipts scanned')
  })

  it('lists the recent expenses linking to /myExpenses', async () => {
    const wrapper = await mountDashboard()
    expect(wrapper.findAll('.recent-item')).toHaveLength(4)
    const links = wrapper.findAll('.panel-link').map((l) => l.attributes('href'))
    expect(links).toContain('/myExpenses')
    expect(links).toContain('/sharedExpenses')
  })

  it('loads dashboard data on mount for the default period', async () => {
    await mountDashboard()
    expect(DashboardService.GetSummary).toHaveBeenCalledWith('month')
  })

  it('re-fetches when a period toggle is clicked', async () => {
    const wrapper = await mountDashboard()
    const vm = wrapper.vm as any
    expect(vm.period).toBe('month')

    await wrapper.findAll('.period-btn')[2].trigger('click')
    await flushPromises()

    expect(vm.period).toBe('year')
    expect(DashboardService.GetSummary).toHaveBeenLastCalledWith('year')
  })

  it('shows an error state with retry when loading fails', async () => {
    ;(DashboardService.GetSummary as any).mockRejectedValue(new Error('down'))
    const wrapper = await mountDashboard()
    expect(wrapper.find('.error-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('down')
    expect(wrapper.find('.state-btn').exists()).toBe(true)
  })
})
