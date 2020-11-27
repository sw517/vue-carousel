import { mount } from '@vue/test-utils'
import VueCarouselPagination from '@/components/VueCarouselPagination'

describe('Vue Carousel Pagination', () => {
  let propsData
  beforeEach(() => {
    propsData = {
      count: 10
    }
  })

  test('it renders correct classes', () => {
    const wrapper = mount(VueCarouselPagination)

    expect(wrapper.classes('v-carousel-pagination')).toBe(true)
    expect(wrapper.find('.v-carousel-pagination__list')).toBeTruthy()
    expect(wrapper.find('.v-carousel-pagination__li')).toBeTruthy()
    expect(wrapper.find('.v-carousel-pagination__btn')).toBeTruthy()
  })

  test('it renders the correct number of buttons', () => {
    const wrapper = mount(VueCarouselPagination, { propsData })
    const buttons = wrapper.findAll('button')

    expect(buttons.length).toBe(propsData.count)
  })

  test('it renders correct list type', async () => {
    const wrapper = mount(VueCarouselPagination, { propsData })

    expect(wrapper.find('ul').element).toBeTruthy()
    await wrapper.setProps({ numbered: true })
    expect(wrapper.find('ol').element).toBeTruthy()
  })

  test('it emits "pagination-click" with correct number on click', async () => {
    const wrapper = mount(VueCarouselPagination, { propsData })

    const buttons = wrapper.findAll('button')
    const buttonIndex = 3
    await buttons.at(buttonIndex).trigger('click')
    expect(wrapper.emitted()['pagination-click'][0][0]).toBe(buttonIndex + 1)
  })
})
