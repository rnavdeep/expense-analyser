import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ExpenseList from '../ExpenseList.vue'

const expenseStoreMock = vi.hoisted(() => ({
  isPageLoading: false,
  expenses: [] as any[],
  totalExpenses: 0,
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

  it('searches on typed text alone, defaulting the field to Title and resetting to page 1', async () => {
    const wrapper = shallowMount(ExpenseList)
    await flushPromises()
    expenseStoreMock.GetExpenses.mockClear()

    const vm = wrapper.vm as any
    vm.currentPage = 4
    vm.searchValue = 'coffee'
    await vm.performSearch()

    expect(vm.currentPage).toBe(1)
    const searchFilter = expenseStoreMock.GetExpenses.mock.calls.at(-1)?.[2]
    expect(searchFilter).toMatchObject({ propertyName: 'Title', value: 'coffee', type: 'like' })
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

  it('filters the loaded page by date range without refetching', async () => {
    const day = 24 * 60 * 60 * 1000
    const isoDaysAgo = (n: number) => new Date(Date.now() - n * day).toISOString()
    expenseStoreMock.expenses = [
      { id: 'e1', title: 'Recent', createdAt: isoDaysAgo(1) },
      { id: 'e2', title: 'Mid-month', createdAt: isoDaysAgo(20) },
      { id: 'e3', title: 'Old', createdAt: isoDaysAgo(60) }
    ]
    expenseStoreMock.GetExpenses.mockClear()
    const wrapper = shallowMount(ExpenseList)
    await flushPromises()
    const vm = wrapper.vm as any

    expect(vm.filteredExpenses).toHaveLength(3)

    vm.dateBucket = 'week'
    expect(vm.filteredExpenses.map((e: any) => e.id)).toEqual(['e1'])

    vm.dateBucket = 'month'
    expect(vm.filteredExpenses.map((e: any) => e.id)).toEqual(['e2'])

    vm.dateBucket = 'earlier'
    expect(vm.filteredExpenses.map((e: any) => e.id)).toEqual(['e3'])

    vm.dateBucket = 'all'
    expect(vm.filteredExpenses).toHaveLength(3)
    // Purely a client-side filter over the already-loaded page — no extra fetch.
    expect(expenseStoreMock.GetExpenses).toHaveBeenCalledTimes(1)
  })

  it('computes page count and a windowed page range from the store total', async () => {
    expenseStoreMock.expenses = Array.from({ length: 9 }, (_, i) => ({ id: `e${i}`, title: `T${i}` }))
    expenseStoreMock.totalExpenses = 91 // 9 per page -> 11 pages
    const wrapper = shallowMount(ExpenseList)
    await flushPromises()
    const vm = wrapper.vm as any

    expect(vm.totalPages).toBe(11)
    expect(vm.pageRangeLabel).toBe('Showing 1–9 of 91')

    vm.currentPage = 6
    expect(vm.pageWindow).toEqual([4, 5, 6, 7, 8])
  })

  it('navigates pages within bounds and ignores out-of-range requests', async () => {
    expenseStoreMock.expenses = Array.from({ length: 9 }, (_, i) => ({ id: `e${i}`, title: `T${i}` }))
    expenseStoreMock.totalExpenses = 20 // 9 per page -> 3 pages
    expenseStoreMock.GetExpenses.mockClear()
    const wrapper = shallowMount(ExpenseList)
    await flushPromises()
    const vm = wrapper.vm as any

    await vm.goToPage(2)
    expect(vm.currentPage).toBe(2)

    // Out of range and no-op requests don't trigger a fetch.
    expenseStoreMock.GetExpenses.mockClear()
    await vm.goToPage(0)
    await vm.goToPage(99)
    await vm.goToPage(2)
    expect(vm.currentPage).toBe(2)
    expect(expenseStoreMock.GetExpenses).not.toHaveBeenCalled()
  })

  it('treats a short page as the last page, blocking Next even if the reported total says otherwise', async () => {
    // A stale/wrong total says there should be a page 2, but this page came back short.
    expenseStoreMock.expenses = [{ id: 'e1', title: 'A' }]
    expenseStoreMock.totalExpenses = 20
    const wrapper = shallowMount(ExpenseList)
    await flushPromises()
    const vm = wrapper.vm as any

    expect(vm.isLastPage).toBe(true)

    expenseStoreMock.GetExpenses.mockClear()
    await vm.goToPage(2)
    expect(vm.currentPage).toBe(1)
    expect(expenseStoreMock.GetExpenses).not.toHaveBeenCalled()
  })

  it('steps back a page and refetches when a page 404s (empty beyond the last page)', async () => {
    expenseStoreMock.expenses = Array.from({ length: 9 }, (_, i) => ({ id: `e${i}`, title: `T${i}` }))
    expenseStoreMock.totalExpenses = 20
    const wrapper = shallowMount(ExpenseList)
    await flushPromises()
    const vm = wrapper.vm as any

    vm.currentPage = 2
    expenseStoreMock.GetExpenses.mockClear()
    expenseStoreMock.GetExpenses.mockRejectedValueOnce(new Error('404')).mockResolvedValueOnce(undefined)

    await vm.onPageChange(2)

    expect(vm.currentPage).toBe(1)
    expect(expenseStoreMock.GetExpenses).toHaveBeenCalledTimes(2)
  })

  it('refetches expenses when the inline create dialog closes', async () => {
    const wrapper = shallowMount(ExpenseList)
    await flushPromises()
    expenseStoreMock.GetExpenses.mockClear()

    const vm = wrapper.vm as any
    vm.showCreateDialog = true
    await flushPromises()
    expect(expenseStoreMock.GetExpenses).not.toHaveBeenCalled()

    vm.showCreateDialog = false
    await flushPromises()
    expect(expenseStoreMock.GetExpenses).toHaveBeenCalled()
  })
})
