import { flushPromises, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SettleUpDialog from '../SettleUpDialog.vue'

vi.mock('@/services/SettlementService', () => ({
  default: { CreateSettlement: vi.fn() }
}))

import SettlementService from '@/services/SettlementService'

const CreateSettlement = SettlementService.CreateSettlement as ReturnType<typeof vi.fn>

const mountDialog = (props = {}) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  return shallowMount(SettleUpDialog, {
    props: {
      modelValue: true,
      payeeUserId: 'u1',
      payeeName: 'Sam',
      maxAmount: 60,
      ...props
    },
    global: { plugins: [pinia] }
  })
}

describe('SettleUpDialog.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prefills the amount with the row net amount', () => {
    const wrapper = mountDialog()
    expect((wrapper.vm as any).amount).toBe(60)
  })

  it('flags a zero or negative amount as invalid', async () => {
    const wrapper = mountDialog()
    ;(wrapper.vm as any).amount = 0
    await flushPromises()
    expect((wrapper.vm as any).amountError).toContain('greater than 0')
  })

  it('flags an amount above the net balance as invalid', async () => {
    const wrapper = mountDialog()
    ;(wrapper.vm as any).amount = 100
    await flushPromises()
    expect((wrapper.vm as any).amountError).toContain('cannot exceed')
  })

  it('confirm creates the settlement, emits settled, and closes the dialog', async () => {
    CreateSettlement.mockResolvedValue({ id: 's1' })
    const wrapper = mountDialog()
    ;(wrapper.vm as any).amount = 40
    ;(wrapper.vm as any).note = 'lunch'

    await (wrapper.vm as any).confirm()

    expect(CreateSettlement).toHaveBeenCalledWith({ payeeUserId: 'u1', amount: 40, note: 'lunch' })
    expect(wrapper.emitted('settled')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })

  it('shows the store error and does not emit settled on failure', async () => {
    CreateSettlement.mockRejectedValue(new Error('boom'))
    const wrapper = mountDialog()

    await (wrapper.vm as any).confirm()

    expect((wrapper.vm as any).error).toBe('boom')
    expect(wrapper.emitted('settled')).toBeFalsy()
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('does not call the service when the amount is invalid', async () => {
    const wrapper = mountDialog()
    ;(wrapper.vm as any).amount = 0

    await (wrapper.vm as any).confirm()

    expect(CreateSettlement).not.toHaveBeenCalled()
  })

  it('resets the form each time the dialog reopens', async () => {
    const wrapper = mountDialog()
    ;(wrapper.vm as any).amount = 10
    ;(wrapper.vm as any).note = 'partial'

    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })

    expect((wrapper.vm as any).amount).toBe(60)
    expect((wrapper.vm as any).note).toBe('')
  })
})
