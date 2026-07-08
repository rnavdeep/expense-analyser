import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BalanceDetail from '../BalanceDetail.vue'

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => ({ params: { userId: 'u1' } })
  }
})

// Mock the service the Settlement store calls so nothing hits the network.
vi.mock('@/services/SettlementService', () => ({
  default: { GetBalanceDetail: vi.fn() }
}))

import SettlementService from '@/services/SettlementService'

const GetBalanceDetail = SettlementService.GetBalanceDetail as ReturnType<typeof vi.fn>

const detail = {
  userId: 'u1',
  userName: 'Sam',
  netAmount: 42,
  direction: 'youOwe',
  entries: [
    {
      type: 'expense',
      id: 'e1',
      description: 'Dinner',
      amount: 60,
      direction: 'youOwe',
      createdAt: '2026-07-05T00:00:00Z'
    },
    {
      type: 'settlement',
      id: 's1',
      description: 'Settlement',
      amount: 18,
      direction: 'owedToYou',
      createdAt: '2026-07-06T00:00:00Z'
    }
  ]
}

const stubs = {
  'v-icon': { template: '<i><slot /></i>' },
  'v-progress-circular': { template: '<div class="stub-spinner" />' },
  'router-link': { template: '<a :href="to"><slot /></a>', props: ['to'] }
}

const mountDetail = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = mount(BalanceDetail, { global: { plugins: [pinia], stubs } })
  await flushPromises()
  return wrapper
}

describe('BalanceDetail.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the balance detail for the route userId on mount', async () => {
    GetBalanceDetail.mockResolvedValue(detail)
    await mountDetail()
    expect(GetBalanceDetail).toHaveBeenCalledWith('u1')
  })

  it('renders the header with the "you owe" phrasing', async () => {
    GetBalanceDetail.mockResolvedValue(detail)
    const wrapper = await mountDetail()
    expect(wrapper.find('.bd-title').text()).toBe('Sam')
    expect(wrapper.find('.bd-net').text()).toContain('You owe Sam')
    expect(wrapper.find('.bd-net').text()).toContain('$42.00')
  })

  it('renders the "owed to you" phrasing', async () => {
    GetBalanceDetail.mockResolvedValue({ ...detail, direction: 'owedToYou' })
    const wrapper = await mountDetail()
    expect(wrapper.find('.bd-net').text()).toContain('Sam owes you')
  })

  it('renders the settled phrasing', async () => {
    GetBalanceDetail.mockResolvedValue({ ...detail, direction: 'settled' })
    const wrapper = await mountDetail()
    expect(wrapper.find('.bd-net').text()).toBe('Settled up')
  })

  it('renders both expense and settlement entries, visually distinguished', async () => {
    GetBalanceDetail.mockResolvedValue(detail)
    const wrapper = await mountDetail()

    const entries = wrapper.findAll('.bd-entry')
    expect(entries).toHaveLength(2)
    expect(entries[0].text()).toContain('Dinner')
    expect(entries[0].text()).toContain('-$60.00')
    expect(entries[1].text()).toContain('Settlement')
    expect(entries[1].text()).toContain('+$18.00')
  })

  it('shows an empty state when there is no history', async () => {
    GetBalanceDetail.mockResolvedValue({ ...detail, entries: [] })
    const wrapper = await mountDetail()
    expect(wrapper.text()).toContain('No history yet.')
  })

  it('shows a loading spinner before the balance detail resolves', async () => {
    GetBalanceDetail.mockReturnValue(new Promise(() => {}))
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(BalanceDetail, { global: { plugins: [pinia], stubs } })
    await flushPromises()
    expect(wrapper.find('.stub-spinner').exists()).toBe(true)
  })

  it('shows an error state with retry when loading fails', async () => {
    GetBalanceDetail.mockRejectedValue(new Error('down'))
    const wrapper = await mountDetail()
    expect(wrapper.find('.error-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('down')

    GetBalanceDetail.mockResolvedValue(detail)
    await wrapper.find('.state-btn').trigger('click')
    await flushPromises()

    expect(wrapper.find('.bd-title').text()).toBe('Sam')
  })
})
