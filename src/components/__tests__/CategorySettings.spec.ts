import { flushPromises, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CategorySettings from '../CategorySettings.vue'
import { useDashboardStore } from '@/stores/Dashboard'
import type { DashboardData } from '@/models/Dashboard'

vi.mock('@/services/CategoryService', () => ({
  default: {
    GetCategories: vi.fn(),
    UpsertCategory: vi.fn(),
    DeleteCategory: vi.fn(),
    GetCategoryExpenses: vi.fn()
  }
}))

import CategoryService from '@/services/CategoryService'

const GetCategories = CategoryService.GetCategories as ReturnType<typeof vi.fn>
const UpsertCategory = CategoryService.UpsertCategory as ReturnType<typeof vi.fn>
const DeleteCategory = CategoryService.DeleteCategory as ReturnType<typeof vi.fn>
const GetCategoryExpenses = CategoryService.GetCategoryExpenses as ReturnType<typeof vi.fn>

const categories = [
  { id: 'c1', name: 'Food', monthlyLimit: 300, spent: 120 },
  { id: 'c2', name: 'Travel', monthlyLimit: 200, spent: 50 }
]

const mountSettings = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = shallowMount(CategorySettings, { global: { plugins: [pinia] } })
  await flushPromises()
  return wrapper
}

describe('CategorySettings.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    GetCategoryExpenses.mockResolvedValue([])
  })

  it('loads and renders category rows from the store', async () => {
    GetCategories.mockResolvedValue(categories)
    const wrapper = await mountSettings()

    expect(GetCategories).toHaveBeenCalledWith('month')

    const rows = wrapper.findAll('.category-row')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('Food')
    expect(rows[0].text()).toContain('$120.00 of $300.00 spent')
  })

  it('shows an empty state when there are no categories', async () => {
    GetCategories.mockResolvedValue([])
    const wrapper = await mountSettings()
    expect(wrapper.text()).toContain('No categories yet')
  })

  it('shows a loading spinner before categories resolve', async () => {
    GetCategories.mockReturnValue(new Promise(() => {}))
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = shallowMount(CategorySettings, { global: { plugins: [pinia] } })
    await flushPromises()
    expect((wrapper.vm as any).isLoading).toBe(true)
    expect(wrapper.findAll('.category-row')).toHaveLength(0)
  })

  it('shows an error state when loading fails', async () => {
    GetCategories.mockRejectedValue(new Error('boom'))
    const wrapper = await mountSettings()
    expect((wrapper.vm as any).error).toBe('boom')
  })

  it('openEditCategoryDialog pre-fills the form from the row and locks the name', async () => {
    GetCategories.mockResolvedValue(categories)
    const wrapper = await mountSettings()

    const vm = wrapper.vm as any
    vm.openEditCategoryDialog(vm.rows[0])

    expect(vm.dialogMode).toBe('edit')
    expect(vm.categoryDialogOpen).toBe(true)
    expect(vm.newCategoryName).toBe('Food')
    expect(vm.newLimit).toBe(300)
  })

  it('submitCategory saves the edited monthly limit for the locked category', async () => {
    GetCategories.mockResolvedValue(categories)
    UpsertCategory.mockResolvedValue({ id: 'c1', name: 'Food', monthlyLimit: 350 })
    const wrapper = await mountSettings()

    const vm = wrapper.vm as any
    vm.openEditCategoryDialog(vm.rows[0])
    vm.newLimit = 350
    await vm.submitCategory()

    expect(UpsertCategory).toHaveBeenCalledWith({ name: 'Food', monthlyLimit: 350 })
    expect(vm.categoryDialogOpen).toBe(false)
  })

  it('seeds the category combobox from dashboard categories minus existing ones', async () => {
    GetCategories.mockResolvedValue(categories)
    const pinia = createPinia()
    setActivePinia(pinia)
    const dashboardStore = useDashboardStore()
    const data: DashboardData = {
      kpis: {
        totalSpent: 0,
        youOwe: 0,
        owedToYou: 0,
        receiptsScanned: 0,
        totalSpentDelta: 0,
        youOweSubtext: '',
        owedToYouSubtext: '',
        receiptsSubtext: ''
      },
      monthly: [],
      categories: [
        { label: 'Food', amount: 0, color: '#000' },
        { label: 'Utilities', amount: 0, color: '#000' }
      ],
      recent: [],
      balances: { youOwe: [], owedToYou: [] },
      categoryLimits: []
    }
    dashboardStore.data = data

    const wrapper = shallowMount(CategorySettings, { global: { plugins: [pinia] } })
    await flushPromises()

    expect((wrapper.vm as any).categoryOptions).toEqual(['Utilities'])
  })

  it('submitCategory saves the new category and resets the form', async () => {
    GetCategories.mockResolvedValue(categories)
    UpsertCategory.mockResolvedValue({ id: 'c3', name: 'Fun', monthlyLimit: 100 })
    const wrapper = await mountSettings()

    const vm = wrapper.vm as any
    vm.openNewCategoryDialog()
    vm.newCategoryName = 'Fun'
    vm.newLimit = 100
    await vm.submitCategory()

    expect(UpsertCategory).toHaveBeenCalledWith({ name: 'Fun', monthlyLimit: 100 })
    expect(vm.newCategoryName).toBe('')
    expect(vm.newLimit).toBeNull()
  })

  it('does not add a category when the form is incomplete', async () => {
    GetCategories.mockResolvedValue(categories)
    const wrapper = await mountSettings()

    const vm = wrapper.vm as any
    vm.openNewCategoryDialog()
    vm.newCategoryName = ''
    vm.newLimit = 100
    await vm.submitCategory()

    expect(UpsertCategory).not.toHaveBeenCalled()
  })

  it('loads the linked-expenses preview when a category is picked', async () => {
    GetCategories.mockResolvedValue(categories)
    GetCategoryExpenses.mockResolvedValue([{ id: 'e1', title: 'Coffee run', amount: 12.2, createdAt: '2026-07-01' }])
    const wrapper = await mountSettings()

    const vm = wrapper.vm as any
    vm.newCategoryName = 'Food'
    await flushPromises()

    expect(GetCategoryExpenses).toHaveBeenCalledWith('Food')
    expect(vm.linkedExpenses).toEqual([{ id: 'e1', title: 'Coffee run', amount: 12.2, createdAt: '2026-07-01' }])
  })

  it('confirmDelete opens the dialog and performDelete calls DeleteCategory', async () => {
    GetCategories.mockResolvedValue(categories)
    DeleteCategory.mockResolvedValue(undefined)
    const wrapper = await mountSettings()

    const vm = wrapper.vm as any
    vm.confirmDelete(vm.rows[0])
    expect(vm.deleteDialogOpen).toBe(true)
    expect(vm.rowPendingDelete).toEqual(vm.rows[0])

    await vm.performDelete()

    expect(DeleteCategory).toHaveBeenCalledWith('c1')
    expect(vm.deleteDialogOpen).toBe(false)
    expect(vm.rowPendingDelete).toBeNull()
  })
})
