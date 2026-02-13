import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ExpenseList from '../ExpenseList.vue'

const expenseStoreMock = vi.hoisted(() => ({
  isPageLoading: false,
  expenses: [],
  GetExpenses: vi.fn().mockResolvedValue(undefined),
  DeleteExpense: vi.fn().mockResolvedValue(true)
}))

vi.mock('@/stores/Expense', () => ({ useExpenseStore: () => expenseStoreMock }))

describe('ExpenseList.vue', () => {
  it('fetches expenses on mount and page change', async () => {
    const wrapper = shallowMount(ExpenseList)
    await flushPromises()

    expect(expenseStoreMock.GetExpenses).toHaveBeenCalled()

    await (wrapper.vm as any).onPageChange(2)
    expect((wrapper.vm as any).currentPage).toBe(2)
  })
})
