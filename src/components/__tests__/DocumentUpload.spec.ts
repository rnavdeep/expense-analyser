import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import DocumentUpload from '../DocumentUpload.vue'

const expenseStoreMock = vi.hoisted(() => ({
  dialogUploadDocs: true,
  expenseId: 'expense-1'
}))

const documentStoreMock = vi.hoisted(() => ({
  documents: [{ id: 'd1', name: 'doc1', url: 'u' }],
  loading: false,
  alertMessage: '',
  deleteDocument: vi.fn().mockResolvedValue(undefined),
  uploadExpenseDoc: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/stores/Expense', () => ({ useExpenseStore: () => expenseStoreMock }))
vi.mock('@/stores/Document', () => ({ useDocumentStore: () => documentStoreMock }))

describe('DocumentUpload.vue', () => {
  it('closes dialog and deletes file via store', async () => {
    const wrapper = shallowMount(DocumentUpload, { props: { expenseId: 'expense-1' } })

    ;(wrapper.vm as any).closeDocumentDialog()
    expect(expenseStoreMock.dialogUploadDocs).toBe(false)

    await (wrapper.vm as any).deleteFile('d1')
    expect(documentStoreMock.deleteDocument).toHaveBeenCalledWith('d1')
  })
})
