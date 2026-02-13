import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AssignUsers from '../AssignUsers.vue'

const expenseStoreMock = vi.hoisted(() => ({
  dialogAssignUsers: true,
  assignedUsers: [],
  isUserAssigning: false,
  AddUserToExpense: vi.fn().mockResolvedValue(undefined),
  GetAssignedUsers: vi.fn().mockResolvedValue(undefined)
}))

const friendsStoreMock = vi.hoisted(() => ({
  getDropdownUsers: vi.fn().mockResolvedValue([{ id: 'u1', username: 'user1' }])
}))

vi.mock('@/stores/Expense', () => ({ useExpenseStore: () => expenseStoreMock }))
vi.mock('@/stores/Friends', () => ({ useFriendsStore: () => friendsStoreMock }))

describe('AssignUsers.vue', () => {
  it('loads dropdown users and adds selected user to expense', async () => {
    const wrapper = shallowMount(AssignUsers, {
      props: { expenseId: 'expense-1' },
      global: { stubs: ['v-dialog', 'v-card', 'v-select', 'v-btn'] }
    })

    await flushPromises()
    expect(friendsStoreMock.getDropdownUsers).toHaveBeenCalled()

    ;(wrapper.vm as any).selectedUserId = 'u1'
    await (wrapper.vm as any).addUserToExpense()

    expect(expenseStoreMock.AddUserToExpense).toHaveBeenCalledWith('expense-1', 'u1')
    expect(expenseStoreMock.GetAssignedUsers).toHaveBeenCalled()
  })
})
