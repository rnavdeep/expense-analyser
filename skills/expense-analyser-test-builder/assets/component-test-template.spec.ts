import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Example:
// import Login from '@/components/Login.vue'
// import { useAuthStore } from '@/stores/Auth'

describe('ComponentName', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('renders expected UI', () => {
    // const wrapper = mount(Login, {
    //   global: {
    //     plugins: [createPinia()],
    //     stubs: ['router-link']
    //   }
    // })
    // expect(wrapper.text()).toContain('Login')
    expect(true).toBe(true)
  })
})
