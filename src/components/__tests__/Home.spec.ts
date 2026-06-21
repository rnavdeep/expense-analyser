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
  it('shows get-started and log-in CTAs when user is logged out', () => {
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

    expect(wrapper.text()).toContain('Get started')
    expect(wrapper.text()).toContain('Log in')
    expect(wrapper.text()).not.toContain('View my expenses')
  })

  it('shows the expenses CTA and hides logged-out CTAs when user is logged in', () => {
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

    expect(wrapper.text()).toContain('View my expenses')
    expect(wrapper.text()).not.toContain('Get started')
  })
})
