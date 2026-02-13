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
})
