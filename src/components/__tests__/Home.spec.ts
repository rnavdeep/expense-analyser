import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Home from '../Home.vue'

const authStoreMock = vi.hoisted(() => ({
  isAuthenticated: false
}))

vi.mock('@/stores/Auth', () => ({
  useAuthStore: () => authStoreMock
}))

describe('Home.vue', () => {
  it('shows login/register prompt when user is logged out', () => {
    authStoreMock.isAuthenticated = false

    const wrapper = mount(Home, {
      global: {
        stubs: {
          'router-link': {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Register or Login to Continue')
    expect(wrapper.text()).toContain('Login')
    expect(wrapper.text()).toContain('Register')
  })

  it('hides login/register prompt when user is logged in', () => {
    authStoreMock.isAuthenticated = true

    const wrapper = mount(Home, {
      global: {
        stubs: {
          'router-link': {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.text()).not.toContain('Register or Login to Continue')
  })
})
