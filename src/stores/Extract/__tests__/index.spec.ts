import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useExtractStore } from '@/stores/Extract'

const startExpenseAnalysisMock = vi.hoisted(() => vi.fn().mockResolvedValue('job-1'))

vi.mock('@/services/ExtractService', () => ({
  default: {
    StartExpenseAnalysis: startExpenseAnalysisMock
  }
}))

describe('Extract store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('startExpenseAnalysis validates and returns job id', async () => {
    const store = useExtractStore()

    await expect(store.startExpenseAnalysis({ expenseId: '', docId: '' })).rejects.toThrow(
      'All fields are required to run extract job.'
    )

    await expect(store.startExpenseAnalysis({ expenseId: 'e1', docId: 'd1' })).resolves.toBe('job-1')
  })
})
