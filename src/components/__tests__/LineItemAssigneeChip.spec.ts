import { shallowMount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LineItemAssigneeChip from '../LineItemAssigneeChip.vue'

const friends = [
  { id: 1, username: 'priya', email: 'priya@example.com' },
  { id: 2, username: 'sam', email: 'sam@example.com' }
]

const mountChip = (assignees: Array<{ userId: string; userName: string }>) =>
  shallowMount(LineItemAssigneeChip, {
    props: {
      assignees,
      friends,
      creatorUserId: 'me',
      lineItemId: 'li1'
    }
  })

describe('LineItemAssigneeChip.vue', () => {
  it('renders "You" for a single self-assignee', () => {
    const wrapper = mountChip([{ userId: 'me', userName: 'Nav' }])
    expect(wrapper.text()).toContain('You')
    expect((wrapper.vm as any).label).toBe('You')
  })

  it('renders "You + Priya" for two assignees including self', () => {
    const wrapper = mountChip([
      { userId: 'me', userName: 'Nav' },
      { userId: '1', userName: 'priya' }
    ])
    expect((wrapper.vm as any).label).toBe('You + priya')
  })

  it('renders "N people" for three or more assignees', () => {
    const wrapper = mountChip([
      { userId: 'me', userName: 'Nav' },
      { userId: '1', userName: 'priya' },
      { userId: '2', userName: 'sam' }
    ])
    expect((wrapper.vm as any).label).toBe('3 people')
  })

  it('lists the creator plus every friend in the checklist', () => {
    const wrapper = mountChip([{ userId: 'me', userName: 'Nav' }])
    const vm = wrapper.vm as any
    expect(vm.filteredRows).toEqual([
      { userId: 'me', userName: 'You' },
      { userId: '1', userName: 'priya' },
      { userId: '2', userName: 'sam' }
    ])
  })

  it('filters the checklist by search text', async () => {
    const wrapper = mountChip([{ userId: 'me', userName: 'Nav' }])
    const vm = wrapper.vm as any
    vm.search = 'sam'
    await wrapper.vm.$nextTick()
    expect(vm.filteredRows).toEqual([{ userId: '2', userName: 'sam' }])
  })

  it('emits toggle-assignee when a friend is checked', () => {
    const wrapper = mountChip([{ userId: 'me', userName: 'Nav' }])
    ;(wrapper.vm as any).onToggle('1', true)
    expect(wrapper.emitted('toggle-assignee')).toEqual([['1', true]])
  })

  it('emits toggle-assignee when unchecking a non-sole assignee', () => {
    const wrapper = mountChip([
      { userId: 'me', userName: 'Nav' },
      { userId: '1', userName: 'priya' }
    ])
    ;(wrapper.vm as any).onToggle('1', false)
    expect(wrapper.emitted('toggle-assignee')).toEqual([['1', false]])
  })

  it('blocks unchecking the sole remaining assignee', () => {
    const wrapper = mountChip([{ userId: 'me', userName: 'Nav' }])
    const vm = wrapper.vm as any
    expect(vm.isSoleAssignee('me')).toBe(true)
    vm.onToggle('me', false)
    expect(wrapper.emitted('toggle-assignee')).toBeFalsy()
  })
})
