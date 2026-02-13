import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import WelcomeItem from '../WelcomeItem.vue'

describe('WelcomeItem.vue', () => {
  it('renders heading and default slots', () => {
    const wrapper = mount(WelcomeItem, {
      slots: {
        heading: 'Heading',
        default: 'Content'
      }
    })

    expect(wrapper.text()).toContain('Heading')
    expect(wrapper.text()).toContain('Content')
  })
})
