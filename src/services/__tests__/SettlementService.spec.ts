import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from '@/models/Pagination'
import SettlementService from '../SettlementService'

vi.mock('axios')

describe('SettlementService', () => {
  it('CreateSettlement posts the request and returns the created settlement', async () => {
    const dto = {
      id: 's1',
      payerUserId: 'me',
      payerUserName: 'Me',
      payeeUserId: 'u1',
      payeeUserName: 'Sam',
      amount: 20,
      note: 'lunch',
      createdAt: '2026-07-08T00:00:00Z'
    }
    ;(axios as any).post = vi.fn().mockResolvedValue({ data: dto })

    const result = await SettlementService.CreateSettlement({
      payeeUserId: 'u1',
      amount: 20,
      note: 'lunch'
    })

    expect(result).toEqual(dto)
    expect((axios as any).post).toHaveBeenCalledWith(
      expect.stringContaining('/Settlement'),
      { payeeUserId: 'u1', amount: 20, note: 'lunch' },
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('GetSettlements passes pagination params', async () => {
    ;(axios as any).get = vi.fn().mockResolvedValue({ data: [] })

    await SettlementService.GetSettlements(new Pagination(1, 10))

    expect((axios as any).get).toHaveBeenCalledWith(
      expect.stringContaining('/Settlement'),
      expect.objectContaining({
        params: { pageNumber: 1, pageSize: 10 },
        withCredentials: true
      })
    )
  })

  it('GetSettlements rethrows 404 as a plain "404" error', async () => {
    const err: any = new Error('request failed')
    err.response = { status: 404 }
    ;(axios as any).get = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(SettlementService.GetSettlements(new Pagination(1, 10))).rejects.toThrow('404')
  })

  it('GetBalanceDetail hits the balances endpoint for the given user', async () => {
    const dto = {
      userId: 'u1',
      userName: 'Sam',
      netAmount: 20,
      direction: 'youOwe',
      entries: []
    }
    ;(axios as any).get = vi.fn().mockResolvedValue({ data: dto })

    const result = await SettlementService.GetBalanceDetail('u1')

    expect(result).toEqual(dto)
    expect((axios as any).get).toHaveBeenCalledWith(
      expect.stringContaining('/Expense/balances/u1'),
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('surfaces the API error message on failure', async () => {
    const err: any = new Error('request failed')
    err.response = { data: { message: 'Boom' } }
    ;(axios as any).post = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(
      SettlementService.CreateSettlement({ payeeUserId: 'u1', amount: 20 })
    ).rejects.toThrow('Boom')
  })
})
