import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
import BudgetService from '../BudgetService'

vi.mock('axios')

describe('BudgetService', () => {
  it('UpsertBudget puts the request and returns the saved budget', async () => {
    const dto = { id: 'b1', category: 'Groceries', monthlyLimit: 300 }
    ;(axios as any).put = vi.fn().mockResolvedValue({ data: dto })

    const result = await BudgetService.UpsertBudget({ category: 'Groceries', monthlyLimit: 300 })

    expect(result).toEqual(dto)
    expect((axios as any).put).toHaveBeenCalledWith(
      expect.stringContaining('/Budget'),
      { category: 'Groceries', monthlyLimit: 300 },
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('GetBudgets passes the period param', async () => {
    ;(axios as any).get = vi.fn().mockResolvedValue({ data: [] })

    await BudgetService.GetBudgets('month')

    expect((axios as any).get).toHaveBeenCalledWith(
      expect.stringContaining('/Budget'),
      expect.objectContaining({
        params: { period: 'month' },
        withCredentials: true
      })
    )
  })

  it('GetBudgets rethrows 404 as a plain "404" error', async () => {
    const err: any = new Error('request failed')
    err.response = { status: 404 }
    ;(axios as any).get = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(BudgetService.GetBudgets('month')).rejects.toThrow('404')
  })

  it('surfaces the API error message on failure', async () => {
    const err: any = new Error('request failed')
    err.response = { data: { message: 'Boom' } }
    ;(axios as any).put = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(
      BudgetService.UpsertBudget({ category: 'Groceries', monthlyLimit: 300 })
    ).rejects.toThrow('Boom')
  })

  it('DeleteBudget deletes by category', async () => {
    ;(axios as any).delete = vi.fn().mockResolvedValue({})

    await BudgetService.DeleteBudget('Groceries')

    expect((axios as any).delete).toHaveBeenCalledWith(
      expect.stringContaining('/Budget'),
      expect.objectContaining({
        params: { category: 'Groceries' },
        withCredentials: true
      })
    )
  })

  it('DeleteBudget surfaces the API error message on failure', async () => {
    const err: any = new Error('request failed')
    err.response = { data: { message: 'Boom' } }
    ;(axios as any).delete = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(BudgetService.DeleteBudget('Groceries')).rejects.toThrow('Boom')
  })
})
