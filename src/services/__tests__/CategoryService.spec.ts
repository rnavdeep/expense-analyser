import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
import CategoryService from '../CategoryService'

vi.mock('axios')

describe('CategoryService', () => {
  it('UpsertCategory puts the request and returns the saved category', async () => {
    const dto = { id: 'c1', name: 'Groceries', monthlyLimit: 300 }
    ;(axios as any).put = vi.fn().mockResolvedValue({ data: dto })

    const result = await CategoryService.UpsertCategory({ name: 'Groceries', monthlyLimit: 300 })

    expect(result).toEqual(dto)
    expect((axios as any).put).toHaveBeenCalledWith(
      expect.stringContaining('/Category'),
      { name: 'Groceries', monthlyLimit: 300 },
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('GetCategories passes the period param', async () => {
    ;(axios as any).get = vi.fn().mockResolvedValue({ data: [] })

    await CategoryService.GetCategories('month')

    expect((axios as any).get).toHaveBeenCalledWith(
      expect.stringContaining('/Category'),
      expect.objectContaining({
        params: { period: 'month' },
        withCredentials: true
      })
    )
  })

  it('GetCategories rethrows 404 as a plain "404" error', async () => {
    const err: any = new Error('request failed')
    err.response = { status: 404 }
    ;(axios as any).get = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(CategoryService.GetCategories('month')).rejects.toThrow('404')
  })

  it('surfaces the API error message on failure', async () => {
    const err: any = new Error('request failed')
    err.response = { data: { message: 'Boom' } }
    ;(axios as any).put = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(
      CategoryService.UpsertCategory({ name: 'Groceries', monthlyLimit: 300 })
    ).rejects.toThrow('Boom')
  })

  it('DeleteCategory deletes by id', async () => {
    ;(axios as any).delete = vi.fn().mockResolvedValue({})

    await CategoryService.DeleteCategory('c1')

    expect((axios as any).delete).toHaveBeenCalledWith(
      expect.stringContaining('/Category/c1'),
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('DeleteCategory surfaces the API error message on failure', async () => {
    const err: any = new Error('request failed')
    err.response = { data: { message: 'Nope' } }
    ;(axios as any).delete = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(CategoryService.DeleteCategory('c1')).rejects.toThrow('Nope')
  })

  it('GetCategoryExpenses fetches the category-linked expenses', async () => {
    const expenses = [{ id: 'e1', title: 'Coffee run', amount: 12.2, createdAt: '2026-07-01' }]
    ;(axios as any).get = vi.fn().mockResolvedValue({ data: expenses })

    const result = await CategoryService.GetCategoryExpenses('Dining')

    expect(result).toEqual(expenses)
    expect((axios as any).get).toHaveBeenCalledWith(
      expect.stringContaining('/Category/Dining/expenses'),
      expect.objectContaining({ withCredentials: true })
    )
  })

  it('GetCategoryExpenses surfaces the API error message on failure', async () => {
    const err: any = new Error('request failed')
    err.response = { data: { message: 'Boom' } }
    ;(axios as any).get = vi.fn().mockRejectedValue(err)
    ;(axios as any).isAxiosError = () => true

    await expect(CategoryService.GetCategoryExpenses('Dining')).rejects.toThrow('Boom')
  })
})
