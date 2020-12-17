import { mount } from '@vue/test-utils'
import VueCarousel from '@/components/VueCarousel'
import VueCarouselPagination from '@/components/VueCarouselPagination'

describe('Vue Carousel', () => {
  const slideCount = 10
  let slots

  beforeEach(() => {
    slots = {}
    for (let i = 0; i < slideCount; i += 1) {
      slots[i] = `
        <template>
          <div>Slide ${i}</div>
        </template>
      `
    }
  })

  test('it renders correct classes', () => {
    const wrapper = mount(VueCarousel, { slots })

    expect(wrapper.classes('v-carousel')).toBe(true)
    expect(wrapper.find('.v-carousel__wrap').element).toBeTruthy()
    expect(wrapper.find('.v-carousel__cycle').element).toBeTruthy()
    expect(wrapper.find('.v-carousel__slide').element).toBeTruthy()
  })

  test('it renders the correct number of slides', () => {
    const wrapper = mount(VueCarousel, { slots })

    expect(wrapper.findAll('.v-carousel__slide')).toHaveLength(slideCount)
  })

  test('it renders the correct number of slides with loop', async () => {
    const slidesVisible = 5
    const wrapper = mount(VueCarousel, {
      slots,
      propsData: {
        config: { loop: true, slidesVisible: { xs: slidesVisible } }
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.v-carousel__slide')).toHaveLength(
      slideCount + slidesVisible * 2
    )
  })

  test('it renders controls if set in config', async () => {
    const wrapper = mount(VueCarousel, {
      slots,
      propsData: {
        config: { controls: { showButtons: false, showPagination: false } }
      }
    })

    expect(
      wrapper.find('.v-carousel__controls__btn--next').element
    ).not.toBeTruthy()
    expect(
      wrapper.find('.v-carousel__controls__btn--prev').element
    ).not.toBeTruthy()
    expect(
      wrapper.findComponent(VueCarouselPagination).element
    ).not.toBeTruthy()

    await wrapper.setProps({
      config: { controls: { showButtons: true, showPagination: true } }
    })
    expect(
      wrapper.find('.v-carousel__controls__btn--next').element
    ).toBeTruthy()
    expect(
      wrapper.find('.v-carousel__controls__btn--prev').element
    ).toBeTruthy()
    expect(wrapper.findComponent(VueCarouselPagination).element).toBeTruthy()
  })

  test('it emits "slide-change" event with slide number on button click', async () => {
    const wrapper = mount(VueCarousel, {
      slots,
      propsData: {
        config: { controls: { showButtons: true } }
      }
    })

    await wrapper.find('.v-carousel__controls__btn--next').trigger('click')
    /*
      First item in 'slide-change' event array is set in mounted hook
      so we check the second item (index base zero) for emitted data.
      Starting slide should be 0, so slide-change should be 1 if clicking next.
    */
    expect(wrapper.emitted()['slide-change'][1]).toEqual([1])
  })

  test('it emits "slide-change" event with slide number on pagination click', async () => {
    const wrapper = mount(VueCarousel, {
      slots,
      propsData: {
        config: { controls: { showPagination: true } }
      }
    })
    const slideIndexClicked = 5

    await wrapper
      .findAll('.v-carousel-pagination__btn')
      .at(slideIndexClicked)
      .trigger('click')
    /*
      First item in 'slide-change' event array is set in mounted hook
      so we check the second item (index base zero) for emitted data.
    */
    expect(wrapper.emitted()['slide-change'][1]).toEqual([slideIndexClicked])
  })

  test('it sets the current slide on render to config.startingSlide if valid', async () => {
    const startingSlide = 5 // Must be less than slideCount value (slots.length)
    const wrapper = mount(VueCarousel, {
      slots,
      propsData: {
        config: { startingSlide }
      }
    })

    // Valid startingSlide
    expect(wrapper.vm.$data.startingSlide).toBe(startingSlide)
    await wrapper.setProps({ config: { loop: true } })
    expect(wrapper.vm.$data.startingSlide).toBe(
      wrapper.vm.$data.visibleSlideCount
    )

    // Negative index should result in fallback value used.
    const negativeIndex = -1
    await wrapper.setProps({
      config: { startingSlide: negativeIndex, loop: false }
    })
    expect(wrapper.vm.$data.startingSlide).toBe(0)
    await wrapper.setProps({
      config: { startingSlide: negativeIndex, loop: true }
    })
    expect(wrapper.vm.$data.startingSlide).toBe(
      wrapper.vm.$data.visibleSlideCount
    )

    // Index above slots.length should result in fallback value used.
    const highIndex = 100
    await wrapper.setProps({
      config: { startingSlide: highIndex, loop: false }
    })
    expect(wrapper.vm.$data.startingSlide).toBe(0)
    await wrapper.setProps({ config: { startingSlide: highIndex, loop: true } })
    expect(wrapper.vm.$data.startingSlide).toBe(
      wrapper.vm.$data.visibleSlideCount
    )

    // Valid index that exceeds (slots.length - visibleSlideCount) fallback to
    // next-highest value if "center" and "showEmptySpace" are false.
    const validHighIndex = slideCount - 1
    await wrapper.setProps({
      config: { startingSlide: validHighIndex, loop: false }
    })
    expect(wrapper.vm.$data.startingSlide).toBe(
      slideCount - wrapper.vm.$data.visibleSlideCount
    )
    await wrapper.setProps({
      config: { startingSlide: validHighIndex, loop: true }
    })
    expect(wrapper.vm.$data.startingSlide).toBe(
      validHighIndex + wrapper.vm.$data.visibleSlideCount
    )

    // Valid index that exceeds (slots.length - visibleSlideCount) fallback to
    // next-highest value if either "center" or "showEmptySpace" is true.
    await wrapper.setProps({
      config: { startingSlide: validHighIndex, loop: false, center: true }
    })
    expect(wrapper.vm.$data.startingSlide).toBe(validHighIndex)
    await wrapper.setProps({
      config: {
        startingSlide: validHighIndex,
        loop: false,
        center: false,
        showEmptySpace: true
      }
    })
    expect(wrapper.vm.$data.startingSlide).toBe(validHighIndex)
  })
})
