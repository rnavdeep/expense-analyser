import { flushPromises, shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import DocumentResultPage from '../DocumentResultPage.vue'

const expenseStoreMock = vi.hoisted(() => ({
  dropdownExpenses: [{ id: 'e1', title: 'Expense' }],
  GetExpensesDropdown: vi.fn().mockResolvedValue(undefined),
  GetDocByExpenseId: vi.fn().mockResolvedValue([{ id: 'd1', name: 'Doc' }]),
  GetDocResults: vi.fn().mockResolvedValue({
    columnNames: '[{"title":"Name","key":"name"}]',
    resultLineItems: '[{"name":"line1"}]',
    summaryFields: '{"NAME":"Store"}'
  }),
  AssignUserToLineItem: vi.fn(),
  RemoveUserFromLineItem: vi.fn(),
  AssignUserToAllLineItems: vi.fn()
}))

const friendsStoreMock = vi.hoisted(() => ({
  getDropdownUsers: vi.fn().mockResolvedValue([{ id: 1, username: 'priya', email: 'p@example.com' }])
}))

const authStoreMock = vi.hoisted(() => ({
  userName: 'nav'
}))

vi.mock('@/stores/Expense', () => ({ useExpenseStore: () => expenseStoreMock }))
vi.mock('@/stores/Friends', () => ({ useFriendsStore: () => friendsStoreMock }))
vi.mock('@/stores/Auth', () => ({ useAuthStore: () => authStoreMock }))

// A factory (not a shared const) so each call gets its own object — the
// component assigns `result.lineItems` by reference, and mutating one test's
// optimistic-patch would otherwise leak into a second mocked response.
// resultLineItems is arbitrary OCR column JSON — it never carries an id of
// its own, so this deliberately omits one to match what the real backend
// sends; the component must correlate rows to lineItems positionally.
const makeLineItemResults = () => ({
  columnNames: '[{"title":"Name","key":"name"}]',
  resultLineItems: '[{"name":"line1"}]',
  summaryFields: '{"NAME":"Store"}',
  lineItems: [
    {
      id: 'li1',
      description: 'line1',
      quantity: '1',
      amount: 10,
      sortOrder: 0,
      assignees: [{ userId: 'u-nav', userName: 'nav' }]
    }
  ]
})

const selectExpenseAndDocument = async (wrapper: ReturnType<typeof shallowMount>) => {
  // Selecting an expense triggers a watcher that async-loads its documents and
  // resets selectedDocument to null once that settles, so the document must be
  // chosen only after that settles — otherwise it gets clobbered back to null.
  ;(wrapper.vm as any).selectedExpense = { id: 'e1' }
  await flushPromises()
  ;(wrapper.vm as any).selectedDocument = { id: 'd1' }
  await flushPromises()
  await (wrapper.vm as any).getResults()
}

describe('DocumentResultPage.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    expenseStoreMock.GetExpensesDropdown.mockResolvedValue(undefined)
    expenseStoreMock.GetDocByExpenseId.mockResolvedValue([{ id: 'd1', name: 'Doc' }])
    expenseStoreMock.GetDocResults.mockResolvedValue({
      columnNames: '[{"title":"Name","key":"name"}]',
      resultLineItems: '[{"name":"line1"}]',
      summaryFields: '{"NAME":"Store"}'
    })
    friendsStoreMock.getDropdownUsers.mockResolvedValue([
      { id: 1, username: 'priya', email: 'p@example.com' }
    ])
  })

  it('loads dropdown data and parses results', async () => {
    const wrapper = shallowMount(DocumentResultPage)
    await flushPromises()

    expect(expenseStoreMock.GetExpensesDropdown).toHaveBeenCalled()
    expect(friendsStoreMock.getDropdownUsers).toHaveBeenCalled()

    await selectExpenseAndDocument(wrapper)

    expect(expenseStoreMock.GetDocResults).toHaveBeenCalledWith('e1', 'd1')
    expect((wrapper.vm as any).loading).toBe(false)
  })

  it('leaves the table headers unchanged when the expense has no line items', async () => {
    const wrapper = shallowMount(DocumentResultPage)
    await flushPromises()
    await selectExpenseAndDocument(wrapper)

    expect((wrapper.vm as any).tableHeaders).toEqual([{ title: 'Name', key: 'name' }])
  })

  it('appends an "Assigned to" column and derives the creator userId when line items are present', async () => {
    expenseStoreMock.GetDocResults.mockResolvedValue(makeLineItemResults())
    const wrapper = shallowMount(DocumentResultPage)
    await flushPromises()
    await selectExpenseAndDocument(wrapper)

    const vm = wrapper.vm as any
    expect(vm.tableHeaders).toEqual([
      { title: 'Name', key: 'name' },
      { title: 'Assigned to', key: '__assignedTo', sortable: false }
    ])
    expect(vm.creatorUserId).toBe('u-nav')
    expect(vm.lineItemFor('li1').assignees).toEqual([{ userId: 'u-nav', userName: 'nav' }])
  })

  it('correlates resultLineItems rows to lineItems by sortOrder even though the rows carry no id', async () => {
    expenseStoreMock.GetDocResults.mockResolvedValue({
      columnNames: '[{"title":"Name","key":"name"}]',
      resultLineItems: '[{"name":"line-a"},{"name":"line-b"}]',
      summaryFields: '{"NAME":"Store"}',
      lineItems: [
        // Deliberately returned out of extraction order to prove the match
        // is keyed on sortOrder, not array position within lineItems.
        { id: 'li-b', description: 'line-b', quantity: '1', amount: 5, sortOrder: 1, assignees: [] },
        { id: 'li-a', description: 'line-a', quantity: '1', amount: 5, sortOrder: 0, assignees: [] }
      ]
    })
    const wrapper = shallowMount(DocumentResultPage)
    await flushPromises()
    await selectExpenseAndDocument(wrapper)

    const vm = wrapper.vm as any
    expect(vm.columnData[0].id).toBe('li-a')
    expect(vm.columnData[1].id).toBe('li-b')
    expect(vm.lineItemFor(vm.columnData[0].id)?.description).toBe('line-a')
    expect(vm.lineItemFor(vm.columnData[1].id)?.description).toBe('line-b')
  })

  it('optimistically patches assignees and calls the store on toggle', async () => {
    expenseStoreMock.GetDocResults.mockResolvedValue(makeLineItemResults())
    expenseStoreMock.AssignUserToLineItem.mockResolvedValue({
      id: 'li1',
      assignees: [
        { userId: 'u-nav', userName: 'nav' },
        { userId: '1', userName: 'priya' }
      ]
    })
    const wrapper = shallowMount(DocumentResultPage)
    await flushPromises()
    await selectExpenseAndDocument(wrapper)

    await (wrapper.vm as any).onToggleAssignee('li1', '1', true)

    expect(expenseStoreMock.AssignUserToLineItem).toHaveBeenCalledWith('li1', '1')
    expect((wrapper.vm as any).lineItemFor('li1').assignees).toEqual([
      { userId: 'u-nav', userName: 'nav' },
      { userId: '1', userName: 'priya' }
    ])
  })

  it('reverts the optimistic patch and resyncs on toggle failure', async () => {
    expenseStoreMock.GetDocResults.mockResolvedValueOnce(makeLineItemResults())
    expenseStoreMock.AssignUserToLineItem.mockRejectedValue(new Error('400'))
    const wrapper = shallowMount(DocumentResultPage)
    await flushPromises()
    await selectExpenseAndDocument(wrapper)

    expenseStoreMock.GetDocResults.mockResolvedValueOnce(makeLineItemResults())
    await (wrapper.vm as any).onToggleAssignee('li1', '1', true)

    expect(expenseStoreMock.GetDocResults).toHaveBeenCalledTimes(2)
    expect((wrapper.vm as any).lineItemFor('li1').assignees).toEqual([
      { userId: 'u-nav', userName: 'nav' }
    ])
  })

  it('assigns every line item to the chosen user via the bulk-assign menu', async () => {
    expenseStoreMock.GetDocResults.mockResolvedValue(makeLineItemResults())
    expenseStoreMock.AssignUserToAllLineItems.mockResolvedValue([
      {
        id: 'li1',
        description: 'line1',
        quantity: '1',
        amount: 10,
        sortOrder: 0,
        assignees: [
          { userId: 'u-nav', userName: 'nav' },
          { userId: '1', userName: 'priya' }
        ]
      }
    ])
    const wrapper = shallowMount(DocumentResultPage)
    await flushPromises()
    await selectExpenseAndDocument(wrapper)

    await (wrapper.vm as any).assignAllTo('1')

    expect(expenseStoreMock.AssignUserToAllLineItems).toHaveBeenCalledWith('e1', '1')
    expect((wrapper.vm as any).lineItems[0].assignees).toEqual([
      { userId: 'u-nav', userName: 'nav' },
      { userId: '1', userName: 'priya' }
    ])
  })

  it('surfaces an error when the bulk-assign call fails', async () => {
    expenseStoreMock.GetDocResults.mockResolvedValue(makeLineItemResults())
    expenseStoreMock.AssignUserToAllLineItems.mockRejectedValue(new Error('Users must be friends.'))
    const wrapper = shallowMount(DocumentResultPage)
    await flushPromises()
    await selectExpenseAndDocument(wrapper)

    await (wrapper.vm as any).assignAllTo('1')

    expect((wrapper.vm as any).assignAllError).toBe('Users must be friends.')
  })
})
