import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useExpenseStore } from '@/stores/Expense'
import { ExpenseDataDto } from '@/models/ExpenseCreateForm'
import ExpenseService from '@/services/ExpenseService'

const createExpenseMock = vi.hoisted(() => vi.fn().mockResolvedValue('expense-1'))
const getExpensesMock = vi.hoisted(() => vi.fn().mockResolvedValue({ expenses: [], totalRows: 0 }))

vi.mock('@/services/ExpenseService', () => ({
  default: {
    CreateExpense: createExpenseMock,
    GetExpenses: getExpensesMock,
    updateExpense: vi.fn().mockResolvedValue(true),
    UploadExpenseDoc: vi.fn().mockResolvedValue(true),
    GetExpensesCount: vi.fn().mockResolvedValue(0),
    GetExpensesDropdown: vi.fn().mockResolvedValue([]),
    GetExpenseUsers: vi.fn().mockResolvedValue([]),
    DeleteExpense: vi.fn().mockResolvedValue(true),
    GetDocByExpenseId: vi.fn().mockResolvedValue([]),
    GetDocResults: vi.fn().mockResolvedValue([]),
    AddUserToExpense: vi.fn().mockResolvedValue('id'),
    GetSharedExpenses: vi.fn().mockResolvedValue({ expenses: [], totalRows: 0 })
  }
}))

describe('Expense store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('createExpense sets expenseId and uploadSuccess', async () => {
    const store = useExpenseStore()

    await store.createExpense(new ExpenseDataDto('Lunch', 'Team lunch'))

    expect(store.expenseId).toBe('expense-1')
    expect(store.uploadSuccess).toBe(true)
  })

  it('GetExpenses updates list state', async () => {
    const store = useExpenseStore()

    await store.GetExpenses({ pageNumber: 1, pageSize: 10 } as any, null, null)

    expect(getExpensesMock).toHaveBeenCalled()
    expect(store.totalExpenses).toBe(0)
  })

  it('BulkDeleteExpenses tallies deleted and failed results', async () => {
    const store = useExpenseStore()
    const deleteMock = ExpenseService.DeleteExpense as ReturnType<typeof vi.fn>
    deleteMock
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(true)

    const result = await store.BulkDeleteExpenses([
      { id: 'e1' } as any,
      { id: 'e2' } as any,
      { id: 'e3' } as any
    ])

    expect(deleteMock).toHaveBeenCalledTimes(3)
    expect(result).toEqual({ deleted: 2, failed: 1 })
  })
})
