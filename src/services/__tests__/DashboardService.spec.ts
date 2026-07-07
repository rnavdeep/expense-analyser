import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
import DashboardService from '../DashboardService'

vi.mock('axios')

describe('DashboardService', () => {
  it('GetSummary passes the period and returns data', async () => {
    ;(axios as any).get = vi.fn().mockResolvedValue({ data: { totalSpent: 100 } })

    const data = await DashboardService.GetSummary('quarter')

    expect(data.totalSpent).toBe(100)
    expect((axios as any).get).toHaveBeenCalledWith(
      expect.stringContaining('/Expense/summary'),
      expect.objectContaining({ params: { period: 'quarter' }, withCredentials: true })
    )
  })

  it('GetMonthly passes the months param', async () => {
    ;(axios as any).get = vi.fn().mockResolvedValue({ data: [] })

    await DashboardService.GetMonthly(6)

    expect((axios as any).get).toHaveBeenCalledWith(
      expect.stringContaining('/Expense/monthly'),
      expect.objectContaining({ params: { months: 6 }, withCredentials: true })
    )
  })

  it('GetBalances hits the balances endpoint with credentials', async () => {
    ;(axios as any).get = vi.fn().mockResolvedValue({ data: { youOwe: [], owedToYou: [] } })

    const data = await DashboardService.GetBalances()

    expect(data.youOwe).toEqual([])
    expect((axios as any).get).toHaveBeenCalledWith(
      expect.stringContaining('/Expense/balances'),
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('surfaces the API error message on failure', async () => {
    const err: any = new Error('request failed')
    err.response = { data: { message: 'Boom' } }
    ;(axios as any).get = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(DashboardService.GetSummary('month')).rejects.toThrow('Boom')
  })
})
