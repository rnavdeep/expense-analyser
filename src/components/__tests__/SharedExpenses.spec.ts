import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import SharedExpenses from '../SharedExpenses.vue'

const expenseStoreMock = vi.hoisted(() => ({
  isPageLoading: false,
  expenses: [],
  GetSharedExpenses: vi.fn().mockResolvedValue(undefined),
  DeleteExpense: vi.fn().mockResolvedValue(true)
}))

vi.mock('@/stores/Expense', () => ({ useExpenseStore: () => expenseStoreMock }))

describe('SharedExpenses.vue', () => {
  it('fetches shared expenses on mount', async () => {
    shallowMount(SharedExpenses)
    await flushPromises()

    expect(expenseStoreMock.GetSharedExpenses).toHaveBeenCalled()
  })
})
