import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
import ExpenseService from '../ExpenseService'

vi.mock('axios')

describe('ExpenseService', () => {
  it('CreateExpense returns id from API', async () => {
    ;(axios as any).post = vi.fn().mockResolvedValue({ data: { id: 'expense-1' } })

    const id = await ExpenseService.CreateExpense({ title: 'T' })

    expect(id).toBe('expense-1')
  })

  it('GetExpenses passes paging params and returns payload', async () => {
    ;(axios as any).get = vi.fn().mockResolvedValue({ data: { expenses: [], totalRows: 0 } })

    const payload = await ExpenseService.GetExpenses({ pageNumber: 1, pageSize: 10 } as any, null, null)

    expect(payload.totalRows).toBe(0)
    expect((axios as any).get).toHaveBeenCalledWith(
      expect.stringContaining('/Expense'),
      expect.objectContaining({ withCredentials: true })
    )
  })
})
