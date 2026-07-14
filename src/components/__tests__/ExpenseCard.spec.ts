import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ExpenseCard from '../ExpenseCard.vue'

const expenseStoreMock = vi.hoisted(() => ({
  isUpdating: false,
  isUpdateSuccessful: true,
  GetDocByExpenseId: vi.fn().mockResolvedValue([]),
  GetAssignedUsersDto: vi.fn().mockResolvedValue([]),
  updateExpense: vi.fn().mockResolvedValue(true)
}))

const docStoreMock = vi.hoisted(() => ({
  deleteDocumentFromExpense: vi.fn().mockResolvedValue(undefined)
}))

const extractStoreMock = vi.hoisted(() => ({
  startExpenseAnalysis: vi.fn().mockResolvedValue('job-1')
}))

vi.mock('@/stores/Expense', () => ({ useExpenseStore: () => expenseStoreMock }))
vi.mock('@/stores/Document', () => ({ useDocumentStore: () => docStoreMock }))
vi.mock('@/stores/Extract', () => ({ useExtractStore: () => extractStoreMock }))

describe('ExpenseCard.vue', () => {
  it('opens edit dialog and emits delete after confirmation', async () => {
    const wrapper = shallowMount(ExpenseCard, {
      props: {
        expense: { id: 'e1', title: 'T', description: 'D', amount: 10, createdAt: '2026-01-01' },
        index: 0,
        isReadOnly: false
      }
    })

    ;(wrapper.vm as any).openEditDialog()
    expect((wrapper.vm as any).dialogEdit).toBe(true)

    ;(wrapper.vm as any).confirmDeletion()
    ;(wrapper.vm as any).deleteExpense()

    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('renders a checkbox and emits toggle-select when selectable', () => {
    const expense = { id: 'e1', title: 'T', description: 'D', amount: 10, createdAt: '2026-01-01' }
    const wrapper = shallowMount(ExpenseCard, {
      props: { expense, index: 0, isReadOnly: false, selectable: true, selected: false }
    })

    expect(wrapper.find('.ec-select').exists()).toBe(true)

    ;(wrapper.vm as any).onToggleSelect()

    expect(wrapper.emitted('toggle-select')).toBeTruthy()
    expect(wrapper.emitted('toggle-select')?.[0]).toEqual([expense])
  })

  it('does not render the checkbox when not selectable', () => {
    const wrapper = shallowMount(ExpenseCard, {
      props: {
        expense: { id: 'e1', title: 'T', description: 'D', amount: 10, createdAt: '2026-01-01' },
        index: 0,
        isReadOnly: false
      }
    })

    expect(wrapper.find('.ec-select').exists()).toBe(false)
  })

  it('blocks saving an amount below the scanned receipts total', async () => {
    const expense = {
      id: 'e1',
      title: 'T',
      description: 'D',
      amount: 10,
      createdAt: '2026-01-01',
      scannedReceiptsTotal: 100
    }
    const wrapper = shallowMount(ExpenseCard, {
      props: { expense, index: 0, isReadOnly: false }
    })
    const vm = wrapper.vm as any
    vm.openEditDialog()
    vm.editAmount = 50

    await vm.saveExpense('e1')

    expect(expenseStoreMock.updateExpense).not.toHaveBeenCalled()
    expect(vm.editAmountError).toContain('100')
    expect(vm.dialogEdit).toBe(true)
  })

  it('saves an amount at or above the scanned receipts total', async () => {
    const expense = {
      id: 'e1',
      title: 'T',
      description: 'D',
      amount: 10,
      createdAt: '2026-01-01',
      scannedReceiptsTotal: 100
    }
    const wrapper = shallowMount(ExpenseCard, {
      props: { expense, index: 0, isReadOnly: false }
    })
    const vm = wrapper.vm as any
    vm.openEditDialog()
    vm.editAmount = 150

    await vm.saveExpense('e1')

    expect(expenseStoreMock.updateExpense).toHaveBeenCalledWith(
      'e1',
      expect.objectContaining({ amount: 150 })
    )
    expect(vm.dialogEdit).toBe(false)
  })
})
