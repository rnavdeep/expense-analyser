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

  it('AssignUserToLineItem PUTs to the assignees endpoint and returns the line item', async () => {
    ;(axios as any).put = vi.fn().mockResolvedValue({ data: { id: 'li-1', assignees: [] } })

    const lineItem = await ExpenseService.AssignUserToLineItem('li-1', 'user-1')

    expect(lineItem.id).toBe('li-1')
    expect((axios as any).put).toHaveBeenCalledWith(
      expect.stringContaining('/Expense/lineItem/li-1/assignees/user-1'),
      null,
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('AssignUserToLineItem surfaces the API error message on failure', async () => {
    const err: any = new Error('request failed')
    err.response = { data: { message: 'Boom' } }
    ;(axios as any).put = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(ExpenseService.AssignUserToLineItem('li-1', 'user-1')).rejects.toThrow('Boom')
  })

  it('RemoveUserFromLineItem DELETEs the assignees endpoint and returns the line item', async () => {
    ;(axios as any).delete = vi.fn().mockResolvedValue({ data: { id: 'li-1', assignees: [] } })

    const lineItem = await ExpenseService.RemoveUserFromLineItem('li-1', 'user-1')

    expect(lineItem.id).toBe('li-1')
    expect((axios as any).delete).toHaveBeenCalledWith(
      expect.stringContaining('/Expense/lineItem/li-1/assignees/user-1'),
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('RemoveUserFromLineItem surfaces the API error message on failure', async () => {
    const err: any = new Error('request failed')
    err.response = { data: { message: 'Cannot remove the last remaining assignee from a line item.' } }
    ;(axios as any).delete = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(ExpenseService.RemoveUserFromLineItem('li-1', 'user-1')).rejects.toThrow(
      'Cannot remove the last remaining assignee from a line item.'
    )
  })

  it('AssignUserToAllLineItems PUTs to the assignAll endpoint and returns all line items', async () => {
    ;(axios as any).put = vi.fn().mockResolvedValue({ data: [{ id: 'li-1', assignees: [] }] })

    const lineItems = await ExpenseService.AssignUserToAllLineItems('expense-1', 'user-1')

    expect(lineItems).toHaveLength(1)
    expect((axios as any).put).toHaveBeenCalledWith(
      expect.stringContaining('/Expense/expense-1/lineItems/assignAll/user-1'),
      null,
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('AssignUserToAllLineItems surfaces the API error message on failure', async () => {
    const err: any = new Error('request failed')
    err.response = { data: { message: 'Boom' } }
    ;(axios as any).put = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(ExpenseService.AssignUserToAllLineItems('expense-1', 'user-1')).rejects.toThrow('Boom')
  })
})
