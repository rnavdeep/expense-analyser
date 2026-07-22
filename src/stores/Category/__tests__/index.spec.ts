import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCategoryStore } from '@/stores/Category'

vi.mock('@/services/CategoryService', () => ({
  default: {
    UpsertCategory: vi.fn(),
    GetCategories: vi.fn(),
    DeleteCategory: vi.fn()
  }
}))

import CategoryService from '@/services/CategoryService'

const UpsertCategory = CategoryService.UpsertCategory as ReturnType<typeof vi.fn>
const GetCategories = CategoryService.GetCategories as ReturnType<typeof vi.fn>
const DeleteCategory = CategoryService.DeleteCategory as ReturnType<typeof vi.fn>

const category = { id: 'c1', name: 'Groceries', monthlyLimit: 300, spent: 120 }

describe('Category store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('LoadCategories populates the list on success', async () => {
    GetCategories.mockResolvedValue([category])
    const store = useCategoryStore()

    await store.LoadCategories()

    expect(store.categories).toEqual([category])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('LoadCategories swallows a 404 into an empty list', async () => {
    GetCategories.mockRejectedValue(new Error('404'))
    const store = useCategoryStore()

    await store.LoadCategories()

    expect(store.categories).toEqual([])
    expect(store.error).toBeNull()
  })

  it('LoadCategories captures other errors', async () => {
    GetCategories.mockRejectedValue(new Error('boom'))
    const store = useCategoryStore()

    await store.LoadCategories()

    expect(store.error).toBe('boom')
  })

  it('SaveCategory upserts then reloads the categories', async () => {
    UpsertCategory.mockResolvedValue({ id: 'c1', name: 'Groceries', monthlyLimit: 300 })
    GetCategories.mockResolvedValue([category])
    const store = useCategoryStore()

    await store.SaveCategory({ name: 'Groceries', monthlyLimit: 300 })

    expect(UpsertCategory).toHaveBeenCalledWith({ name: 'Groceries', monthlyLimit: 300 })
    expect(store.categories).toEqual([category])
    expect(store.isSaving).toBe(false)
    expect(store.error).toBeNull()
  })

  it('SaveCategory captures the error and rethrows', async () => {
    UpsertCategory.mockRejectedValue(new Error('boom'))
    const store = useCategoryStore()

    await expect(store.SaveCategory({ name: 'Groceries', monthlyLimit: 300 })).rejects.toThrow(
      'boom'
    )
    expect(store.error).toBe('boom')
    expect(store.isSaving).toBe(false)
  })

  it('DeleteCategory deletes then reloads the categories', async () => {
    DeleteCategory.mockResolvedValue(undefined)
    GetCategories.mockResolvedValue([])
    const store = useCategoryStore()

    await store.DeleteCategory('c1')

    expect(DeleteCategory).toHaveBeenCalledWith('c1')
    expect(store.categories).toEqual([])
    expect(store.isSaving).toBe(false)
    expect(store.error).toBeNull()
  })

  it('DeleteCategory captures the error and rethrows', async () => {
    DeleteCategory.mockRejectedValue(new Error('boom'))
    const store = useCategoryStore()

    await expect(store.DeleteCategory('c1')).rejects.toThrow('boom')
    expect(store.error).toBe('boom')
    expect(store.isSaving).toBe(false)
  })

  it('utilization returns spent/monthlyLimit for a known category', () => {
    const store = useCategoryStore()
    store.categories = [category]

    expect(store.utilization('Groceries')).toBe(120 / 300)
  })

  it('utilization guards against divide-by-zero and unknown categories', () => {
    const store = useCategoryStore()
    store.categories = [{ id: 'c2', name: 'Rent', monthlyLimit: 0, spent: 50 }]

    expect(store.utilization('Rent')).toBe(0)
    expect(store.utilization('Unknown')).toBe(0)
  })
})
