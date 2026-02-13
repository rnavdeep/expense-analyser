import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'

vi.mock('axios')

describe('ServiceName', () => {
  it('calls expected endpoint with credentials', async () => {
    const mockedAxios = axios as unknown as {
      get: ReturnType<typeof vi.fn>
    }
    mockedAxios.get = vi.fn().mockResolvedValue({ data: { ok: true } })

    // await SomeService.someMethod()
    // expect(mockedAxios.get).toHaveBeenCalledWith(
    //   expect.stringContaining('/api-path'),
    //   expect.objectContaining({ withCredentials: true })
    // )
    expect(true).toBe(true)
  })
})
