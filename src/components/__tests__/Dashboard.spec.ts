import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Dashboard from '../Dashboard.vue'

const authStoreMock = vi.hoisted(() => ({
  userName: 'alex'
}))

vi.mock('@/stores/Auth', () => ({
  useAuthStore: () => authStoreMock
}))

// Stub the chart wrappers so chart.js / canvas never renders in jsdom.
const stubs = {
  MonthlyBarChart: { template: '<div class="stub-bar" />' },
  CategoryDonut: { template: '<div class="stub-donut" />' },
  'router-link': { template: '<a :href="to"><slot /></a>', props: ['to'] },
  'v-icon': { template: '<i><slot /></i>' }
}

const mountDashboard = () => mount(Dashboard, { global: { stubs } })

describe('Dashboard.vue', () => {
  it('greets the authenticated user by name', () => {
    const wrapper = mountDashboard()
    expect(wrapper.text()).toContain('alex')
    expect(wrapper.find('.dash-greeting').text()).toMatch(/Good (morning|afternoon|evening), alex/)
  })

  it('renders the four KPI cards', () => {
    const wrapper = mountDashboard()
    const cards = wrapper.findAll('.kpi-card')
    expect(cards).toHaveLength(4)
    const text = wrapper.text()
    expect(text).toContain('Total spent')
    expect(text).toContain('You owe')
    expect(text).toContain('Owed to you')
    expect(text).toContain('Receipts scanned')
  })

  it('lists four recent expenses linking to /myExpenses', () => {
    const wrapper = mountDashboard()
    expect(wrapper.findAll('.recent-item')).toHaveLength(4)
    const links = wrapper.findAll('.panel-link').map((l) => l.attributes('href'))
    expect(links).toContain('/myExpenses')
    expect(links).toContain('/sharedExpenses')
  })

  it('switches the period when a toggle is clicked', async () => {
    const wrapper = mountDashboard()
    const vm = wrapper.vm as any
    expect(vm.period).toBe('month')

    await wrapper.findAll('.period-btn')[2].trigger('click')
    expect(vm.period).toBe('year')
  })
})
