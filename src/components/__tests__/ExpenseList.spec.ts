import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ExpenseList from '../ExpenseList.vue'

const expenseStoreMock = vi.hoisted(() => ({
  isPageLoading: false,
  expenses: [] as any[],
  GetExpenses: vi.fn().mockResolvedValue(undefined),
  DeleteExpense: vi.fn().mockResolvedValue(true),
  BulkDeleteExpenses: vi.fn().mockResolvedValue({ deleted: 1, failed: 0 })
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

  it('selects expenses and bulk deletes them through the store', async () => {
    expenseStoreMock.expenses = [
      { id: 'e1', title: 'A' },
      { id: 'e2', title: 'B' }
    ]
    const wrapper = shallowMount(ExpenseList)
    await flushPromises()

    const vm = wrapper.vm as any
    vm.toggleSelectMode()
    expect(vm.selectMode).toBe(true)

    vm.toggleSelect({ id: 'e1' })
    vm.toggleSelect({ id: 'e2' })
    expect(vm.selectedIds).toEqual(['e1', 'e2'])

    // Deselecting removes the id
    vm.toggleSelect({ id: 'e2' })
    expect(vm.selectedIds).toEqual(['e1'])

    await vm.confirmBulkDelete()

    expect(expenseStoreMock.BulkDeleteExpenses).toHaveBeenCalledWith([{ id: 'e1', title: 'A' }])
    expect(expenseStoreMock.GetExpenses).toHaveBeenCalled()
    expect(vm.selectedIds).toEqual([])
    expect(vm.selectMode).toBe(false)
  })
})
