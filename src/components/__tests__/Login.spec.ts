import { shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Login from '../Login.vue'

const pushMock = vi.fn()

const authStoreMock = vi.hoisted(() => ({
  loginResponse: {
    isLoggedIn: false,
    errors: ''
  },
  login: vi.fn()
}))

vi.mock('@/stores/Auth', () => ({
  useAuthStore: () => authStoreMock
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock
    })
  }
})

describe('Login.vue', () => {
  beforeEach(() => {
    pushMock.mockReset()
    authStoreMock.login.mockReset()
    authStoreMock.loginResponse = { isLoggedIn: false, errors: '' }
  })

  it('renders login title', () => {
    const wrapper = shallowMount(Login, {
      global: {
        stubs: {
          'router-link': true,
          'v-container': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-form': true,
          'v-text-field': true,
          'v-btn': true,
          'v-alert': true
        }
      }
    })

    expect((wrapper.vm as any).formData.username).toBe('')
    expect((wrapper.vm as any).formData.password).toBe('')
    expect(typeof (wrapper.vm as any).handlelogin).toBe('function')
  })

  it('navigates home on successful login', async () => {
    authStoreMock.login.mockImplementation(async () => {
      authStoreMock.loginResponse = { isLoggedIn: true, errors: '' }
    })

    const wrapper = shallowMount(Login, {
      global: {
        stubs: {
          'router-link': true,
          'v-container': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-form': true,
          'v-text-field': true,
          'v-btn': true,
          'v-alert': true
        }
      }
    })

    ;(wrapper.vm as any).formData.username = 'demo'
    ;(wrapper.vm as any).formData.password = 'secret'
    await (wrapper.vm as any).handlelogin()

    expect(pushMock).toHaveBeenCalledWith('/dashboard')
    expect((wrapper.vm as any).successMessage).toContain('Login successful')
  })

  it('shows validation error from auth store on failed login', async () => {
    authStoreMock.login.mockImplementation(async () => {
      authStoreMock.loginResponse = {
        isLoggedIn: false,
        errors: 'Invalid credentials'
      }
    })

    const wrapper = shallowMount(Login, {
      global: {
        stubs: {
          'router-link': true,
          'v-container': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-form': true,
          'v-text-field': true,
          'v-btn': true,
          'v-alert': true
        }
      }
    })

    ;(wrapper.vm as any).formData.username = 'demo'
    ;(wrapper.vm as any).formData.password = 'wrong'
    await (wrapper.vm as any).handlelogin()

    expect((wrapper.vm as any).errorMessage).toBe('Invalid credentials')
    expect(pushMock).not.toHaveBeenCalled()
  })
})
