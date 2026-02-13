import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import DocumentResultPage from '../DocumentResultPage.vue'

const expenseStoreMock = vi.hoisted(() => ({
  dropdownExpenses: [{ id: 'e1', title: 'Expense' }],
  GetExpensesDropdown: vi.fn().mockResolvedValue(undefined),
  GetDocByExpenseId: vi.fn().mockResolvedValue([{ id: 'd1', name: 'Doc' }]),
  GetDocResults: vi.fn().mockResolvedValue({
    columnNames: '[{"title":"Name","key":"name"}]',
    resultLineItems: '[{"name":"line1"}]',
    summaryFields: '{"NAME":"Store"}'
  })
}))

vi.mock('@/stores/Expense', () => ({ useExpenseStore: () => expenseStoreMock }))

describe('DocumentResultPage.vue', () => {
  it('loads dropdown data and parses results', async () => {
    const wrapper = shallowMount(DocumentResultPage)
    await flushPromises()

    expect(expenseStoreMock.GetExpensesDropdown).toHaveBeenCalled()

    ;(wrapper.vm as any).selectedExpense = { id: 'e1' }
    ;(wrapper.vm as any).selectedDocument = { id: 'd1' }

    await (wrapper.vm as any).getResults()

    expect(expenseStoreMock.GetDocResults).toHaveBeenCalledWith('e1', 'd1')
    expect((wrapper.vm as any).loading).toBe(false)
  })
})
