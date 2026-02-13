import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
import ExtractService from '../ExtractService'

vi.mock('axios')

describe('ExtractService', () => {
  it('StartExpenseAnalysis returns jobId', async () => {
    ;(axios as any).post = vi.fn().mockResolvedValue({ data: { jobId: 'job-1' } })

    const jobId = await ExtractService.StartExpenseAnalysis({ expenseId: 'e1', docId: 'd1' })

    expect(jobId).toBe('job-1')
  })
})
