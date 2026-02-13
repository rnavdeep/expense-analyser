import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'
import DocumentService from '../DocumentService'

vi.mock('axios')

describe('DocumentService', () => {
  it('DeleteDocument returns true on 204', async () => {
    ;(axios as any).delete = vi.fn().mockResolvedValue({ status: 204 })

    const result = await DocumentService.DeleteDocument('doc-1')

    expect(result).toBe(true)
    expect((axios as any).delete).toHaveBeenCalledWith(
      expect.stringContaining('/Document/doc-1'),
      expect.objectContaining({ withCredentials: true })
    )
  })
})
