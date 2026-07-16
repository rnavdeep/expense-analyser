import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import SharedExpenses from '../SharedExpenses.vue'

const expenseStoreMock = vi.hoisted(() => ({
  isPageLoading: false,
  expenses: [],
  totalExpenses: 0,
  GetSharedExpenses: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/stores/Expense', () => ({ useExpenseStore: () => expenseStoreMock }))

describe('SharedExpenses.vue', () => {
  it('fetches shared expenses on mount', async () => {
    shallowMount(SharedExpenses)
    await flushPromises()

    expect(expenseStoreMock.GetSharedExpenses).toHaveBeenCalled()
  })
})
