import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ExpenseCreate from '../ExpenseCreate.vue'

const expenseStoreMock = vi.hoisted(() => ({
  expenseId: 'e1',
  uploadSuccess: false,
  isUploading: false,
  dialogUploadDocs: false,
  dialogAssignUsers: false,
  assignedUsers: [],
  createExpense: vi.fn().mockImplementation(async () => {
    expenseStoreMock.uploadSuccess = true
    return 'e1'
  }),
  GetAssignedUsers: vi.fn().mockResolvedValue(undefined)
}))

const documentStoreMock = vi.hoisted(() => ({
  documents: []
}))

const categoryStoreMock = vi.hoisted(() => ({
  categories: [
    { id: 'c1', name: 'Food', monthlyLimit: 300, spent: 120 },
    { id: 'c2', name: 'Travel', monthlyLimit: 200, spent: 50 }
  ],
  LoadCategories: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/stores/Expense', () => ({ useExpenseStore: () => expenseStoreMock }))
vi.mock('@/stores/Document', () => ({ useDocumentStore: () => documentStoreMock }))
vi.mock('@/stores/Category', () => ({ useCategoryStore: () => categoryStoreMock }))

describe('ExpenseCreate.vue', () => {
  it('submits form and sets success alert', async () => {
    const wrapper = shallowMount(ExpenseCreate)
    ;(wrapper.vm as any).formInput.title = 'Lunch'
    ;(wrapper.vm as any).formInput.description = 'Team lunch'
    ;(wrapper.vm as any).isFormValid = true

    await (wrapper.vm as any).submitForm()

    expect(expenseStoreMock.createExpense).toHaveBeenCalled()
    expect((wrapper.vm as any).alertMessage.length).toBeGreaterThan(0)
  })

  it('submits the manual amount and receipts toggle', async () => {
    const wrapper = shallowMount(ExpenseCreate)
    ;(wrapper.vm as any).formInput.title = 'Lunch'
    ;(wrapper.vm as any).formInput.description = 'Team lunch'
    ;(wrapper.vm as any).formInput.amount = 42
    ;(wrapper.vm as any).formInput.allowReceipts = false
    ;(wrapper.vm as any).isFormValid = true

    await (wrapper.vm as any).submitForm()

    expect(expenseStoreMock.createExpense).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Lunch', description: 'Team lunch', amount: 42, allowReceipts: false })
    )
  })

  it('hides the upload-bills trigger when receipts are not allowed', async () => {
    const wrapper = shallowMount(ExpenseCreate)
    ;(wrapper.vm as any).formInput.allowReceipts = false
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('Upload bills')
  })

  it('seeds the category dropdown from categories created on the Categories page', async () => {
    const wrapper = shallowMount(ExpenseCreate)
    await wrapper.vm.$nextTick()
    expect(categoryStoreMock.LoadCategories).toHaveBeenCalled()
    expect((wrapper.vm as any).categoryOptions).toEqual(['Food', 'Travel'])
  })

  it('submits the picked category, or undefined when left blank', async () => {
    const wrapper = shallowMount(ExpenseCreate)
    ;(wrapper.vm as any).formInput.title = 'Lunch'
    ;(wrapper.vm as any).formInput.description = 'Team lunch'
    ;(wrapper.vm as any).formInput.category = 'Food'
    ;(wrapper.vm as any).isFormValid = true

    await (wrapper.vm as any).submitForm()

    expect(expenseStoreMock.createExpense).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Food' })
    )

    ;(wrapper.vm as any).formInput.category = ''
    await (wrapper.vm as any).submitForm()

    const lastCallArg = expenseStoreMock.createExpense.mock.calls.at(-1)?.[0]
    expect(lastCallArg.category).toBeUndefined()
  })
})
