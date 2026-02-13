import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import NavigationDrawer from '../NavigationDrawer.vue'

const authStoreMock = vi.hoisted(() => ({
  isAuthenticated: true,
  isSessionActive: true,
  userName: 'alice',
  checkSession: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/stores/Auth', () => ({ useAuthStore: () => authStoreMock }))

describe('NavigationDrawer.vue', () => {
  it('checks session on mount', async () => {
    shallowMount(NavigationDrawer)
    await flushPromises()
    expect(authStoreMock.checkSession).toHaveBeenCalled()
  })
})
