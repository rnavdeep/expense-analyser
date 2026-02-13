import { shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Register from '../Register.vue'

const pushMock = vi.fn()
const registerMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('@/services/AuthService', () => ({
  default: {
    Register: registerMock
  }
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: pushMock })
  }
})

describe('Register.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    pushMock.mockReset()
    registerMock.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('registers successfully and redirects', async () => {
    const wrapper = shallowMount(Register)

    ;(wrapper.vm as any).formData.username = 'alice'
    ;(wrapper.vm as any).formData.email = 'a@example.com'
    ;(wrapper.vm as any).formData.password = 'Password1!'
    ;(wrapper.vm as any).formData.confirmPassword = 'Password1!'
    ;(wrapper.vm as any).formData.roles = ['Reader']

    await (wrapper.vm as any).handleRegister()
    expect(registerMock).toHaveBeenCalled()

    vi.advanceTimersByTime(2000)
    expect(pushMock).toHaveBeenCalledWith('/')
  })
})
