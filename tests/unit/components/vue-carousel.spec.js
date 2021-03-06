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
    /* Valid startingSlide */
    const startIndexValid = 5 // Must be less than slideCount value (slots.length)
    const wrapperValid = mount(VueCarousel, {
      slots,
      propsData: {
        config: { startingSlide: startIndexValid }
      }
    })
    expect(wrapperValid.vm.$data.calculatedStartingSlide).toBe(startIndexValid)

    const wrapperValidLoop = mount(VueCarousel, {
      slots,
      propsData: {
        config: { startingSlide: startIndexValid, loop: true }
      }
    })
    expect(wrapperValidLoop.vm.$data.calculatedStartingSlide).toBe(
      startIndexValid + wrapperValidLoop.vm.$data.visibleSlideCount
    )

    /* Negative index should result in fallback value used. */
    const startIndexNegative = -1
    const wrapperNegative = mount(VueCarousel, {
      slots,
      propsData: {
        config: { startingSlide: startIndexNegative }
      }
    })
    expect(wrapperNegative.vm.$data.calculatedStartingSlide).toBe(0)

    const wrapperNegativeLoop = mount(VueCarousel, {
      slots,
      propsData: {
        config: { startingSlide: startIndexNegative, loop: true }
      }
    })
    expect(wrapperNegativeLoop.vm.$data.calculatedStartingSlide).toBe(
      wrapperNegativeLoop.vm.$data.visibleSlideCount
    )

    /* Index above slots.length should result in fallback value used. */
    const startIndexHigh = 100
    const wrapperHigh = mount(VueCarousel, {
      slots,
      propsData: {
        config: { startingSlide: startIndexHigh }
      }
    })
    expect(wrapperHigh.vm.$data.calculatedStartingSlide).toBe(0)

    const wrapperHighLoop = mount(VueCarousel, {
      slots,
      propsData: {
        config: { startingSlide: startIndexHigh, loop: true }
      }
    })
    expect(wrapperHighLoop.vm.$data.calculatedStartingSlide).toBe(
      wrapperHighLoop.vm.$data.visibleSlideCount
    )

    /* Valid index that exceeds (slots.length - visibleSlideCount) fallback to
        next-highest value if "center" and "showEmptySpace" are FALSE. */
    const startIndexHighButValid = slideCount - 1
    const wrapperHighButValid = mount(VueCarousel, {
      slots,
      propsData: {
        config: { startingSlide: startIndexHighButValid }
      }
    })
    expect(wrapperHighButValid.vm.$data.calculatedStartingSlide).toBe(
      slideCount - wrapperHighButValid.vm.$data.visibleSlideCount
    )

    const wrapperHighButValidLoop = mount(VueCarousel, {
      slots,
      propsData: {
        config: { startingSlide: startIndexHighButValid, loop: true }
      }
    })
    expect(wrapperHighButValidLoop.vm.$data.calculatedStartingSlide).toBe(
      startIndexHighButValid +
        wrapperHighButValidLoop.vm.$data.visibleSlideCount
    )

    /* Valid index that exceeds (slots.length - visibleSlideCount) fallback to
        next-highest value if either "center" or "showEmptySpace" is TRUE. */
    const wrapperHighButValidLoopCenter = mount(VueCarousel, {
      slots,
      propsData: {
        config: { startingSlide: startIndexHighButValid, center: true }
      }
    })
    expect(wrapperHighButValidLoopCenter.vm.$data.calculatedStartingSlide).toBe(
      startIndexHighButValid
    )
  })
})
