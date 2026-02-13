import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDocumentStore } from '@/stores/Document'

const deleteDocumentMock = vi.hoisted(() => vi.fn().mockResolvedValue(true))
const uploadExpenseDocMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ id: 'd1', name: 'doc1', url: 'u' })
)

vi.mock('@/services/DocumentService', () => ({
  default: {
    DeleteDocument: deleteDocumentMock
  }
}))

vi.mock('@/services/ExpenseService', () => ({
  default: {
    UploadExpenseDoc: uploadExpenseDocMock
  }
}))

describe('Document store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('deleteDocument removes item from state', async () => {
    const store = useDocumentStore()
    store.documents = [{ id: 'd1', name: 'doc1', url: 'u' } as any]

    await store.deleteDocument('d1')

    expect(store.documents).toHaveLength(0)
    expect(deleteDocumentMock).toHaveBeenCalledWith('d1')
  })

  it('uploadExpenseDoc validates input', async () => {
    const store = useDocumentStore()
    await expect(store.uploadExpenseDoc({ id: '', file: null })).rejects.toThrow(
      'All fields are required to upload an expense document.'
    )
  })
})
