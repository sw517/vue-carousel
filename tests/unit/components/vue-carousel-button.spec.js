import { mount } from '@vue/test-utils'
import VueCarouselButton from '@/components/VueCarouselButton'

describe('Vue Carousel Button', () => {
  test('it renders correct classes', () => {
    const wrapper = mount(VueCarouselButton)
    expect(wrapper.classes('v-carousel-btn')).toBe(true)
  })

  test('it renders slot as html', () => {
    const wrapper = mount(VueCarouselButton, {
      propsData: {
        content: '&lt;'
      }
    })

    expect(wrapper.text()).not.toBe('&lt;')
    expect(wrapper.text()).toBe('<')
  })
})
