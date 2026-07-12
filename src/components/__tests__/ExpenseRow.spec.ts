import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ExpenseRow from '../ExpenseRow.vue'

const expenseStoreMock = vi.hoisted(() => ({
  isUpdating: false,
  isUpdateSuccessful: true,
  GetDocByExpenseId: vi.fn().mockResolvedValue([]),
  GetAssignedUsersDto: vi.fn().mockResolvedValue([]),
  updateExpense: vi.fn().mockResolvedValue(true),
  AddUserToExpense: vi.fn().mockResolvedValue('assignment-1')
}))

const docStoreMock = vi.hoisted(() => ({
  deleteDocumentFromExpense: vi.fn().mockResolvedValue(undefined),
  uploadExpenseDoc: vi.fn().mockResolvedValue(undefined)
}))

const extractStoreMock = vi.hoisted(() => ({
  startExpenseAnalysis: vi.fn().mockResolvedValue('job-1')
}))

const authStoreMock = vi.hoisted(() => ({
  userName: 'alex'
}))

const friendsStoreMock = vi.hoisted(() => ({
  getDropdownUsers: vi.fn().mockResolvedValue([])
}))

vi.mock('@/stores/Expense', () => ({ useExpenseStore: () => expenseStoreMock }))
vi.mock('@/stores/Document', () => ({ useDocumentStore: () => docStoreMock }))
vi.mock('@/stores/Extract', () => ({ useExtractStore: () => extractStoreMock }))
vi.mock('@/stores/Auth', () => ({ useAuthStore: () => authStoreMock }))
vi.mock('@/stores/Friends', () => ({ useFriendsStore: () => friendsStoreMock }))

const baseExpense = { id: 'e1', title: 'Coffee', description: 'Team catchup', amount: 10, createdAt: '2026-01-01' }

beforeEach(() => {
  expenseStoreMock.GetDocByExpenseId.mockReset().mockResolvedValue([])
  expenseStoreMock.GetAssignedUsersDto.mockReset().mockResolvedValue([])
  expenseStoreMock.AddUserToExpense.mockReset().mockResolvedValue('assignment-1')
  docStoreMock.deleteDocumentFromExpense.mockReset().mockResolvedValue(undefined)
  docStoreMock.uploadExpenseDoc.mockReset().mockResolvedValue(undefined)
  extractStoreMock.startExpenseAnalysis.mockReset().mockResolvedValue('job-1')
  friendsStoreMock.getDropdownUsers.mockReset().mockResolvedValue([])
  authStoreMock.userName = 'alex'
})

describe('ExpenseRow.vue', () => {
  it('opens edit dialog and emits delete after confirmation', () => {
    const wrapper = shallowMount(ExpenseRow, {
      props: { expense: baseExpense, index: 0, isReadOnly: false }
    })

    ;(wrapper.vm as any).openEditDialog()
    expect((wrapper.vm as any).dialogEdit).toBe(true)

    ;(wrapper.vm as any).confirmDeletion()
    ;(wrapper.vm as any).deleteExpense()

    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('renders a checkbox and emits toggle-select when selectable', () => {
    const wrapper = shallowMount(ExpenseRow, {
      props: { expense: baseExpense, index: 0, isReadOnly: false, selectable: true, selected: false }
    })

    expect(wrapper.find('.er-select').exists()).toBe(true)

    ;(wrapper.vm as any).onToggleSelect()

    expect(wrapper.emitted('toggle-select')).toBeTruthy()
    expect(wrapper.emitted('toggle-select')?.[0]).toEqual([baseExpense])
  })

  it('does not render the checkbox when not selectable', () => {
    const wrapper = shallowMount(ExpenseRow, {
      props: { expense: baseExpense, index: 0, isReadOnly: false }
    })

    expect(wrapper.find('.er-select').exists()).toBe(false)
  })

  it('fetches documents and shared users on first expand, and caches on re-toggle', async () => {
    expenseStoreMock.GetDocByExpenseId.mockResolvedValue([
      { id: 'd1', name: 'receipt.pdf', url: 'http://x/d1', jobStatus: null }
    ])
    expenseStoreMock.GetAssignedUsersDto.mockResolvedValue([
      { expenseId: 'e1', userId: 'u1', userName: 'Alex', userShare: 0.5, userAmount: 5 }
    ])
    const wrapper = shallowMount(ExpenseRow, {
      props: { expense: baseExpense, index: 0, isReadOnly: false }
    })
    const vm = wrapper.vm as any

    vm.toggleExpand()
    await flushPromises()

    expect(expenseStoreMock.GetDocByExpenseId).toHaveBeenCalledWith('e1')
    expect(expenseStoreMock.GetAssignedUsersDto).toHaveBeenCalledWith('e1')
    expect(vm.documents).toHaveLength(1)
    expect(vm.usersExpense).toHaveLength(1)

    // Collapse then re-expand: cached lists shouldn't trigger another fetch.
    vm.toggleExpand()
    vm.toggleExpand()
    await flushPromises()

    expect(expenseStoreMock.GetDocByExpenseId).toHaveBeenCalledTimes(1)
    expect(expenseStoreMock.GetAssignedUsersDto).toHaveBeenCalledTimes(1)
  })

  it('treats a doc with no completed job as processable, and one with a job as processed', () => {
    const wrapper = shallowMount(ExpenseRow, {
      props: { expense: baseExpense, index: 0, isReadOnly: false }
    })
    const vm = wrapper.vm as any

    expect(vm.canProcess({ jobStatus: null })).toBe(true)
    expect(vm.canProcess({ jobStatus: 2 })).toBe(true)
    expect(vm.canProcess({ jobStatus: 1 })).toBe(false)
  })

  it('opens the process confirmation dialog and starts extraction on confirm', async () => {
    const wrapper = shallowMount(ExpenseRow, {
      props: { expense: baseExpense, index: 0, isReadOnly: false }
    })
    const vm = wrapper.vm as any
    const doc = { id: 'd1', name: 'receipt.pdf', url: 'http://x/d1', jobStatus: null }

    vm.openConfirmProcessDialog(doc)
    expect(vm.dialogConfirmProcess).toBe(true)
    expect(vm.selectedDocument).toEqual(doc)

    vm.confirmProcessExpenseDoc()
    await flushPromises()

    expect(extractStoreMock.startExpenseAnalysis).toHaveBeenCalledWith({ expenseId: 'e1', docId: 'd1' })
    expect(vm.dialogConfirmProcess).toBe(false)
  })

  it('deletes a document and removes it from the local list', async () => {
    expenseStoreMock.GetDocByExpenseId.mockResolvedValue([
      { id: 'd1', name: 'receipt.pdf', url: 'http://x/d1', jobStatus: null }
    ])
    const wrapper = shallowMount(ExpenseRow, {
      props: { expense: baseExpense, index: 0, isReadOnly: false }
    })
    const vm = wrapper.vm as any
    vm.toggleExpand()
    await flushPromises()
    expect(vm.documents).toHaveLength(1)

    await vm.deleteFile('d1')

    expect(docStoreMock.deleteDocumentFromExpense).toHaveBeenCalledWith('d1')
    expect(vm.documents).toHaveLength(0)
  })

  it('removes a shared user from the local list', async () => {
    expenseStoreMock.GetAssignedUsersDto.mockResolvedValue([
      { expenseId: 'e1', userId: 'u1', userName: 'Alex', userShare: 0.5, userAmount: 5 }
    ])
    const wrapper = shallowMount(ExpenseRow, {
      props: { expense: baseExpense, index: 0, isReadOnly: false }
    })
    const vm = wrapper.vm as any
    vm.toggleExpand()
    await flushPromises()
    expect(vm.usersExpense).toHaveLength(1)

    await vm.deleteUser('u1')

    expect(docStoreMock.deleteDocumentFromExpense).toHaveBeenCalledWith('u1')
    expect(vm.usersExpense).toHaveLength(0)
  })

  it('marks the current user in the shared list and refuses to remove them', async () => {
    expenseStoreMock.GetAssignedUsersDto.mockResolvedValue([
      { expenseId: 'e1', userId: 'u1', userName: 'alex', userShare: 0.5, userAmount: 5 },
      { expenseId: 'e1', userId: 'u2', userName: 'sam', userShare: 0.5, userAmount: 5 }
    ])
    const wrapper = shallowMount(ExpenseRow, {
      props: { expense: baseExpense, index: 0, isReadOnly: false }
    })
    const vm = wrapper.vm as any
    vm.toggleExpand()
    await flushPromises()

    expect(vm.isCurrentUser({ userName: 'alex' })).toBe(true)
    expect(vm.isCurrentUser({ userName: 'sam' })).toBe(false)

    // Attempting to remove yourself is a no-op — the store call never fires.
    await vm.deleteUser('u1')
    expect(docStoreMock.deleteDocumentFromExpense).not.toHaveBeenCalled()
    expect(vm.usersExpense).toHaveLength(2)

    // Removing someone else still works as before.
    await vm.deleteUser('u2')
    expect(docStoreMock.deleteDocumentFromExpense).toHaveBeenCalledWith('u2')
    expect(vm.usersExpense).toHaveLength(1)
  })

  it('excludes friends already sharing the expense from the add-user list', async () => {
    expenseStoreMock.GetAssignedUsersDto.mockResolvedValue([
      { expenseId: 'e1', userId: '2', userName: 'sam', userShare: 0.5, userAmount: 5 }
    ])
    friendsStoreMock.getDropdownUsers.mockResolvedValue([
      { id: 1, username: 'jordan', email: 'jordan@x.com' },
      { id: 2, username: 'sam', email: 'sam@x.com' }
    ])
    const wrapper = shallowMount(ExpenseRow, {
      props: { expense: baseExpense, index: 0, isReadOnly: false }
    })
    const vm = wrapper.vm as any
    vm.toggleExpand()
    await flushPromises()

    expect(vm.availableUsersToAdd).toEqual([{ id: 1, username: 'jordan', email: 'jordan@x.com' }])
  })

  it('adds a user to the expense and refreshes the shared list', async () => {
    friendsStoreMock.getDropdownUsers.mockResolvedValue([
      { id: 1, username: 'jordan', email: 'jordan@x.com' }
    ])
    expenseStoreMock.GetAssignedUsersDto
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ expenseId: 'e1', userId: '1', userName: 'jordan', userShare: 0, userAmount: 0 }])
    const wrapper = shallowMount(ExpenseRow, {
      props: { expense: baseExpense, index: 0, isReadOnly: false }
    })
    const vm = wrapper.vm as any
    vm.toggleExpand()
    await flushPromises()
    expect(vm.usersExpense).toHaveLength(0)

    vm.selectedUserId = 1
    await vm.addUserToExpense()

    expect(expenseStoreMock.AddUserToExpense).toHaveBeenCalledWith('e1', '1')
    expect(expenseStoreMock.GetAssignedUsersDto).toHaveBeenCalledTimes(2)
    expect(vm.usersExpense).toHaveLength(1)
    expect(vm.selectedUserId).toBeNull()
    expect(vm.isAssigningUser).toBe(false)
  })

  it('attaches another document and refreshes the document list', async () => {
    expenseStoreMock.GetDocByExpenseId
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 'd2', name: 'invoice.pdf', url: 'http://x/d2', jobStatus: null }])
    const wrapper = shallowMount(ExpenseRow, {
      props: { expense: baseExpense, index: 0, isReadOnly: false }
    })
    const vm = wrapper.vm as any
    vm.toggleExpand()
    await flushPromises()
    expect(vm.documents).toHaveLength(0)

    const file = new File(['content'], 'invoice.pdf')
    await vm.onAttachDocument({ target: { files: [file], value: '' } })

    expect(docStoreMock.uploadExpenseDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'e1', file })
    )
    expect(expenseStoreMock.GetDocByExpenseId).toHaveBeenCalledTimes(2)
    expect(vm.documents).toHaveLength(1)
    expect(vm.isAttaching).toBe(false)
  })
})
