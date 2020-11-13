<template>
  <div
    @mouseenter="removeAutoplayInterval"
    @mouseleave="addAutoplayInterval"
    @mousedown="removeAutoplayInterval"
    @mouseup="addAutoplayInterval"
    :class="[
      {
        'v-carousel--static': isStatic,
        'v-carousel--draggable': isTrue(sliderConfig.mouseDrag)
      }
    ]"
    class="v-carousel"
  >
    <div
      class="v-carousel__controls"
      v-if="!isStatic && sliderConfig.controls.showButtons"
    >
      <VueCarouselButton
        @click.native="handleControlBtnClick(-1)"
        @click="handleControlBtnClick(-1)"
        :style="sliderConfig.controls.buttonStyles"
        aria-label="Previous Slide"
        class="v-carousel__controls__btn v-carousel__controls__btn--prev"
        :class="{
          'v-carousel__controls__btn--disabled': isButtonDisabled('prev')
        }"
      >
        <slot name="previous">
          <span v-html="sliderConfig.controls.previous" />
        </slot>
      </VueCarouselButton>
      <VueCarouselButton
        @click.native="handleControlBtnClick(1)"
        @click="handleControlBtnClick(1)"
        :style="sliderConfig.controls.buttonStyles"
        aria-label="Next Slide"
        class="v-carousel__controls__btn v-carousel__controls__btn--next"
        :class="{
          'v-carousel__controls__btn--disabled': isButtonDisabled('next')
        }"
      >
        <slot name="next">
          <span v-html="sliderConfig.controls.next" />
        </slot>
      </VueCarouselButton>
    </div>
    <div ref="v-carousel-wrap" class="v-carousel__wrap">
      <div ref="cycle" :style="cCycleStyles" class="v-carousel__cycle">
        <div
          v-for="(slot, index) in cSlideIndexArray"
          :key="getSlideKey(index)"
          :style="cSlideStyles"
          class="v-carousel__slide"
        >
          <slot :name="slot" />
        </div>
      </div>
    </div>
    <VueCarouselPagination
      v-if="this.slideCount > 0 && isTrue(sliderConfig.controls.showPagination)"
      :count="cPaginationCount"
      :current="cPaginationCurrent"
      :button-styles="sliderConfig.controls.paginationStyles"
      :numbered="$props.sliderConfig.controls.paginationNumbered"
      @pagination-click="onPaginationButtonClick"
    />
  </div>
</template>

<script>
// Helpers
import merge from 'lodash.merge'
import cloneDeep from 'lodash.clonedeep'
import isTrue from '../scripts/helpers/isTrue' //'@/scripts/helpers/isTrue'
// Components
import VueCarouselButton from './VueCarouselButton.vue'
import VueCarouselPagination from './VueCarouselPagination.vue'

export default {
  name: 'VueCarousel',
  components: {
    VueCarouselButton,
    VueCarouselPagination
  },
  props: {
    config: {
      type: Object,
      required: false,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      autoplayIntervalId: null,
      carouselWidth: null,
      currentBreakpoint: 'xs',
      currentSlide: 0,
      currentWindowWidth: 0,
      disableTransition: false,
      dragPosition: null,
      isSkippingSlides: false,
      isStatic: false,
      slideCount: this.setSlideCount(),
      sliderConfig: {},
      touchEvent: {
        swipeStartPosition: null,
        swipeEndPosition: null,
        swipeMovePosition: null,
        startTimeStamp: null,
        endTimeStamp: null,
        moveTimeStamp: null
      },
      visibleSlideCount: 1
    }
  },
  computed: {
    cSlideIndexArray() {
      const slides = []
      for (let i = 0; i < this.slideCount; i += 1) slides.push(i)
      if (!this.sliderConfig.loop || this.isStatic) return slides

      const prefixSlides = []
      const suffixSlides = []
      const visibleSlideCount = Math.ceil(this.visibleSlideCount)

      for (
        let i = this.slideCount - 1;
        i >= this.slideCount - visibleSlideCount;
        i -= 1
      )
        prefixSlides.unshift(i)

      for (let i = 0; i <= visibleSlideCount * 2; i += 1) suffixSlides.push(i)

      return [...prefixSlides, ...slides, ...suffixSlides]
    },
    /**
     * Returns the CSS Styles for the individual slides.
     * Only styles the slides if not static.
     */
    cSlideStyles() {
      return {
        minWidth: this.isStatic ? null : `${100 / this.visibleSlideCount}%`,
        width: this.isStatic ? null : `${100 / this.visibleSlideCount}%`,
        paddingLeft: this.getSlidePadding(this.sliderConfig.slidePadding),
        paddingRight: this.getSlidePadding(this.sliderConfig.slidePadding)
      }
    },
    /**
     * Returns the CSS Styles for the carousel cycle.
     * Only styles if not static.
     */
    cCycleStyles() {
      if (this.isStatic) return null

      let transform

      if (this.dragPosition) {
        transform =
          (this.currentSlide * this.carouselWidth) / this.visibleSlideCount -
          this.dragPosition
      } else {
        transform =
          (this.currentSlide * this.carouselWidth) / this.visibleSlideCount
      }
      return {
        transform: `translateX(-${transform}px)`,
        transition: this.disableTransition || this.dragPosition ? 'none' : null
      }
    },
    cPaginationCount() {
      return isTrue(this.sliderConfig.showEmptySpace) ||
        isTrue(this.sliderConfig.loop)
        ? this.slideCount
        : this.slideCount - Math.floor(this.visibleSlideCount) + 1
    },
    cPaginationCurrent() {
      if (isTrue(this.sliderConfig.loop)) {
        return this.currentSlide - Math.ceil(this.visibleSlideCount) + 1
      } else {
        return this.currentSlide + 1
      }
    }
  },
  watch: {
    currentWindowWidth() {
      this.setCurrentBreakpoint()
      this.setCarouselWidth()
    },
    currentBreakpoint() {
      this.setVisibleSlideCount(this.sliderConfig.slidesVisible)
      this.setIsStatic()
    },
    config: {
      handler() {
        this.removeAutoplayInterval()
        this.removeMouseDragEventListeners()
        this.setUpConfig()
        this.setSlideCount()
        this.setIsStatic()
        this.setVisibleSlideCount(this.sliderConfig.slidesVisible)

        if (this.sliderConfig.loop) {
          this.skipToSlide(Math.ceil(this.visibleSlideCount))
        } else {
          this.skipToSlide(0)
        }

        if (isTrue(this.sliderConfig.mouseDrag)) {
          this.addMouseDragEventListeners()
        }

        if (isTrue(this.sliderConfig.autoplay)) {
          this.addAutoplayInterval()
        }
      },
      deep: true
    }
  },
  created() {
    this.setUpConfig()
    this.setSlideCount()
  },
  mounted() {
    this.setSlideCount()
    this.recordCurrentWindowWidth()
    this.setCurrentBreakpoint()
    this.setIsStatic()
    this.setCarouselWidth()
    this.setVisibleSlideCount(this.sliderConfig.slidesVisible)

    if (isTrue(this.sliderConfig.loop)) {
      this.setCurrentSlide(Math.ceil(this.visibleSlideCount))
    } else {
      this.setCurrentSlide(0)
    }

    this.addTouchEventListeners()
    this.addResizeListener()

    if (isTrue(this.sliderConfig.mouseDrag)) {
      this.addMouseDragEventListeners()
    }

    if (isTrue(this.sliderConfig.autoplay)) {
      this.addAutoplayInterval()
    }
  },
  updated() {
    this.setSlideCount()
    this.setCarouselWidth()
  },
  beforeDestroy() {
    this.removeResizeListener()
    this.removeAutoplayInterval()
  },
  methods: {
    isTrue,
    /**
     * Merges default slider config and custom props config
     * into one configuration object used by the component.
     */
    setUpConfig() {
      const defaultConfig = () => ({
        autoplay: false,
        autoplayHoverPause: false,
        autoplayInterval: 3000,
        breakpoints: {
          xs: 0,
          sm: 600,
          md: 980,
          lg: 1200,
          xl: 1600
        },
        controls: {
          previous: '&lt;',
          next: '&gt;',
          buttonStyles: null,
          paginationNumbered: false,
          paginationStyles: null,
          showButtons: true,
          showPagination: false
        },
        loop: false,
        mouseDrag: false,
        showEmptySpace: false,
        slidePadding: {
          xs: null,
          sm: null,
          md: null,
          lg: null,
          xl: null
        },
        slidesVisible: {
          xs: 1,
          sm: null,
          md: null,
          lg: null,
          xl: null
        },
        staticBreakpoint: null
      })

      // Clone props.config to validate individual parameters.
      const clonedPropsConfig = cloneDeep(this.$props.config)

      if (Object.keys(clonedPropsConfig)) {
        // If any breakpoint is invalid, validateBreakpoints will return false.
        clonedPropsConfig.breakpoints = this.validateBreakpoints(
          clonedPropsConfig.breakpoints
        )
          ? clonedPropsConfig.breakpoints
          : defaultConfig().breakpoints

        // validateSlidesVisible will remove individual breakpoints if invalid or
        // return an empty object if all are invalid or not set.
        const validatedSlidesVisible = this.validateSlidesVisible(
          clonedPropsConfig.slidesVisible
        )

        clonedPropsConfig.slidesVisible = Object.keys(validatedSlidesVisible)
          .length
          ? validatedSlidesVisible
          : defaultConfig().slidesVisible
      }

      this.sliderConfig = Object.assign(
        {},
        merge(defaultConfig(), clonedPropsConfig)
      )
    },
    /**
     * Validate each breakpoint in the config object.
     * @param {object} propsConfig The breakpoints object from props config.
     * @return {boolean} Returns true if propsConfig is valid breakpoints object.
     */
    validateBreakpoints(propsConfig) {
      if (propsConfig) {
        try {
          if (
            propsConfig.xs < propsConfig.sm &&
            propsConfig.sm < propsConfig.md &&
            propsConfig.md < propsConfig.lg &&
            propsConfig.lg < propsConfig.xl
          ) {
            return true
          }

          console.warn(
            'Invalid breakpoints. Using default breakpoints instead.',
            '\nconfig.breakpoints: ',
            propsConfig
          )
        } catch (error) {
          console.warn(error)
        }
      }
      return false
    },
    /**
     * Validate each property in the slidesVisible object from the
     * slider config. If a value is not a number or is greater than
     * the total number of slides, the key/value pair is removed from
     * the object.
     * @param {object} config The object containing the slides visible keys/values.
     * @return {object} The validated config object
     */
    validateSlidesVisible(config) {
      if (!config) return {}

      return Object.keys(config).reduce((acc, key) => {
        if (
          typeof Number(config[key]) === 'number' &&
          Number(config[key]) !== 0
        ) {
          acc[key] = Number(config[key])
        } else if (
          config[key] !== '' &&
          config[key] !== null &&
          config[key] !== undefined
        ) {
          console.warn(
            `Invalid slidesVisible value. \nconfig.slidesVisible.${key} must be a valid positive number.`
          )
        }
        return acc
      }, {})
    },
    /**
     * Apply a resize event listener to update the current
     * window width and breakpoint.
     */
    addResizeListener() {
      if (typeof window !== undefined) {
        window.addEventListener('resize', this.recordCurrentWindowWidth)
      }
    },
    /**
     * Remove resize event listener from window.
     */
    removeResizeListener() {
      if (typeof window !== undefined) {
        window.removeEventListener('resize', this.recordCurrentWindowWidth)
      }
    },
    /**
     * Records the current width of documentElement.
     */
    recordCurrentWindowWidth() {
      this.currentWindowWidth = document.documentElement.clientWidth
    },
    /**
     * Filter breakpoints to find current breakpoint using
     * currentWindowWidth.
     */
    setCurrentBreakpoint() {
      const { currentWindowWidth, sliderConfig } = this
      const { sm, md, lg, xl } = sliderConfig.breakpoints

      // Do not change order as the find() function will return
      // the first breakpoint that matches its conditions.
      const breakpointsArray = [
        { breakpoint: 'xl', min: xl },
        { breakpoint: 'lg', min: lg },
        { breakpoint: 'md', min: md },
        { breakpoint: 'sm', min: sm },
        { breakpoint: 'xs', min: 0 }
      ]

      const currentBreakpointObject = breakpointsArray.find(
        breakpointObject => {
          return currentWindowWidth >= breakpointObject.min
        }
      )
      this.currentBreakpoint = currentBreakpointObject.breakpoint
    },
    setCurrentSlide(slideNumber) {
      this.currentSlide = slideNumber
    },
    /**
     * Calculate slide count based on slots passed. Slides
     * should be named with integers with base-zero i.e 0,1,2...
     * New slots added should be filtered out in this method to
     * ensure slide count is correct.
     */
    setSlideCount() {
      this.slideCount = Object.keys(this.$slots).filter(
        key => key !== 'previous' && key !== 'next'
      ).length
    },
    /**
     * Set the width of the carousel as a data property. This is
     * used to calculate the carousel transformation.
     * Called on mounted() and on window resize.
     */
    setCarouselWidth() {
      this.carouselWidth = this.$refs['v-carousel-wrap'].clientWidth
    },
    /**
     * Gets the current breakpoint and slider config to
     * detirmine how many slides should currently be visible.
     * This component is built mobile first so if only mobile
     * is set, this will also affect tablet and desktop.
     * @param {number} arg.xs Number of slides visible at mobile
     * @param {number} arg.sm Number of slides visible at tablet
     * @param {number} arg.md Number of slides visible at laptop
     * @param {number} arg.lg Number of slides visible at desktop
     * @param {number} arg.xl Number of slides visible at large desktop (1600px)
     */
    setVisibleSlideCount({ xs, sm, md, lg, xl }) {
      switch (this.currentBreakpoint) {
        case 'xl':
          this.visibleSlideCount = xl || lg || md || sm || xs
          break
        case 'lg':
          this.visibleSlideCount = lg || md || sm || xs
          break
        case 'md':
          this.visibleSlideCount = md || sm || xs
          break
        case 'sm':
          this.visibleSlideCount = sm || xs
          break
        default:
          this.visibleSlideCount = xs // Set to 1 by default in props
          break
      }
    },
    /**
     * Gets the current breakpoint and slider config to
     * detirmine whether the slider should be static or able to slide.
     * This component is built mobile first so if only mobile
     * is set, this will also affect tablet and desktop.
     */
    setIsStatic() {
      let isStatic = false

      switch (this.currentBreakpoint) {
        case 'xl':
          isStatic = ['xs', 'sm', 'md', 'lg', 'xl'].includes(
            this.sliderConfig.staticBreakpoint
          )
          break
        case 'lg':
          isStatic = ['xs', 'sm', 'md', 'lg'].includes(
            this.sliderConfig.staticBreakpoint
          )
          break
        case 'md':
          isStatic = ['xs', 'sm', 'md'].includes(
            this.sliderConfig.staticBreakpoint
          )
          break
        case 'sm':
          isStatic = ['xs', 'sm'].includes(this.sliderConfig.staticBreakpoint)
          break
        default:
          isStatic = ['xs'].includes(this.sliderConfig.staticBreakpoint)
          break
      }

      this.isStatic = isStatic
    },
    /**
     * This method is used to ensure that the key for the slide is
     * the same when changing the value of sliderConfig.loop. This is
     * to prevent the slides flickering when re-rendering.
     */
    getSlideKey(index) {
      if (isTrue(this.sliderConfig.loop)) {
        return index - Math.ceil(this.visibleSlideCount)
      } else {
        return index
      }
    },
    /**
     * Gets the current breakpoint and slider config to
     * detirmine the padding for each slide. This component is built
     * mobile first so if only mobile or tablet padding is set, this
     * will affect laptop and desktop too.
     * Unit should be included i.e '10px' or '1rem', otherwise the unit
     * will be assumed as a pixel value and 'px' is affixed.
     * @param {string} arg.xs Slide padding at mobile
     * @param {string} arg.sm Slide padding at tablet
     * @param {string} arg.md Slide padding at laptop
     * @param {string} arg.lg Slide padding at desktop
     * @param {string} arg.xl Slide padding at large desktop (1600px)
     */
    getSlidePadding({ xs, sm, md, lg, xl }) {
      let padding = null

      switch (this.currentBreakpoint) {
        case 'xl':
          padding = xl || lg || md || sm || xs
          break
        case 'lg':
          padding = lg || md || sm || xs
          break
        case 'md':
          padding = md || sm || xs
          break
        case 'sm':
          padding = sm || xs
          break
        default:
          padding = xs
          break
      }

      // Checks if value is either number with missing unit or
      // a string equivalent of a number i.e "20"
      if (typeof Number(padding) === 'number') {
        padding += 'px'
      }

      return padding
    },
    /**
     * If autoplay is true, set an interval to automatically
     * increment the current slide.
     */
    addAutoplayInterval() {
      if (!this.autoplayIntervalId && isTrue(this.sliderConfig.autoplay)) {
        this.autoplayIntervalId = setInterval(
          this.autoIncrement,
          this.sliderConfig.autoplayInterval
        )
      }
    },
    /**
     * If autoplay is true, remove the interval which automatically
     * increments the current slide.
     */
    removeAutoplayInterval() {
      if (this.autoplayIntervalId) {
        clearInterval(this.autoplayIntervalId)
        this.autoplayIntervalId = null
      }
    },
    /**
     * Increment the current slide by 1. If loop is disabled, reset
     * the current slide to the first slide when the carousel reaches
     * the last slide.
     */
    autoIncrement() {
      if (this.sliderConfig.loop) {
        this.handlePaginationWithLoop(1)
      } else {
        if (
          this.currentSlide + 1 <=
          this.slideCount - Math.floor(this.visibleSlideCount)
        ) {
          this.handlePagination(1)
        } else {
          this.setCurrentSlide(0)
        }
      }
    },
    /**
     * Uses data properties on the component to store co-ordinates
     * and timestamps to detirmine the direction of the touch swipe.
     */
    addTouchEventListeners() {
      const carousel = this.$refs['v-carousel-wrap']

      carousel.addEventListener('touchstart', this.recordPressDownStart)
      carousel.addEventListener('touchend', this.recordPressDownEnd)
      carousel.addEventListener('touchmove', this.recordPressDownMove, {
        passive: false
      })
    },
    /**
     * Uses data properties on the component to store co-ordinates
     * and timestamps to detirmine the direction of the mouse drag.
     */
    addMouseDragEventListeners() {
      const carousel = this.$refs['v-carousel-wrap']

      carousel.addEventListener('mousedown', this.recordPressDownStart)
      carousel.addEventListener('mouseup', this.recordPressDownEnd)
      carousel.addEventListener('mousemove', this.recordPressDownMove)
    },
    /**
     * Remove the mouse event listeners to ensure they are not duplicated
     * when the config prop updates and the watcher resets the carousel.
     */
    removeMouseDragEventListeners() {
      const carousel = this.$refs['v-carousel-wrap']

      carousel.removeEventListener('mousedown', this.recordPressDownStart)
      carousel.removeEventListener('mouseup', this.recordPressDownEnd)
      carousel.addEventListener('mousemove', this.recordPressDownMove)
    },
    /**
     * Record the position and timestamp of the mousedown or touchstart event.
     * @param {event} e mousedown or touchstart event.
     */
    recordPressDownStart(e) {
      // Touch event uses changedTouches, mousedown does not.
      let pressEvent = e.changedTouches ? e.changedTouches['0'] : e
      this.touchEvent.swipeStartPosition = pressEvent.pageX
      this.touchEvent.startTimeStamp = e.timeStamp

      // Temporarily disable autoplay when user is interacting with carousel.
      if (this.autoplayIntervalId) {
        this.removeAutoplayInterval()
      }
    },
    /**
     * Record the position and timestamp of the mouseup or touchend event.
     * @param {event} e mouseup or touchend event.
     */
    recordPressDownEnd(e) {
      // Touch event uses changedTouches, mouseup does not.
      let pressEvent = e.changedTouches ? e.changedTouches['0'] : e
      this.touchEvent.swipeEndPosition = pressEvent.pageX
      this.touchEvent.endTimeStamp = e.timeStamp
      this.handleTouchEvent()

      // Re-add autoplay when user stops interacting with carousel.
      if (isTrue(this.sliderConfig.autoplay)) {
        this.addAutoplayInterval()
      }
    },
    /**
     * Record the position and timestamp of the mousemove or touchmove event.
     * @param {event} e mousemove or touchmove event.
     */
    recordPressDownMove(e) {
      // Prevent page scrolling for touch event.
      e.preventDefault()
      if (this.touchEvent.endTimeStamp < this.touchEvent.startTimeStamp) {
        // Touch event uses changedTouches, mousemove does not.
        let pressEvent = e.changedTouches ? e.changedTouches['0'] : e
        this.touchEvent.swipeMovePosition =
          pressEvent.pageX - this.touchEvent.swipeStartPosition
        this.touchEvent.moveTimeStamp = e.timeStamp
        this.handleTouchEvent()
      }
    },
    handleControlBtnClick(increment) {
      if (isTrue(this.sliderConfig.loop)) {
        this.handlePaginationWithLoop(increment)
      } else {
        this.handlePagination(increment)
      }
    },
    /**
     * Handle logic from touch end and move events.
     * If user is still dragging the carousel cycle, update the drag position,
     * else handle updating the pagination.
     */
    handleTouchEvent() {
      // Do not allow swiping if carousel is in the process of skipping
      // slides as this will cause the carousel to swipe past last slide.
      if (this.isSkippingSlides) return

      if (
        !this.touchEvent.endTimeStamp ||
        this.touchEvent.endTimeStamp < this.touchEvent.moveTimeStamp
      ) {
        this.setDragPosition(this.touchEvent.swipeMovePosition)
      } else {
        this.handleTouchSlide()
      }
    },
    /**
     * Set the distance of how far user has dragged with touch event.
     * @param {number} position Distance in pixels the carousel cycle is dragged.
     */
    setDragPosition(position) {
      this.dragPosition = position
    },
    /**
     * Handle the logic for moving the carousel cycle based on user touch slide.
     * The method will check if the user dragged the cycle for the allowed
     * amount of time and decide which method to handle pagination based on
     * if the carousel is looped.
     */
    handleTouchSlide() {
      // Reset drag position to prevent inteference.
      this.setDragPosition(null)
      const startPos = this.touchEvent.swipeStartPosition
      const endPos = this.touchEvent.swipeEndPosition

      // Return if touch was not a long enough full swipe.
      if (Math.abs(startPos - endPos) <= 10) return

      const allowedTime = 2000
      const swipeTime =
        this.touchEvent.endTimeStamp - this.touchEvent.startTimeStamp

      if (swipeTime < allowedTime) {
        const increment = this.calculateTouchSlideIncrement(this.touchEvent)

        if (isTrue(this.sliderConfig.loop)) {
          this.handlePaginationWithLoop(increment)
        } else {
          this.handlePagination(increment)
        }
      }
    },
    /**
     * Calculate how many slides to increment the carousel by. Slide
     * will not increment if user drags by only half a slide and takes
     * longer than the allowed amount of time to do so.
     * @param {number} arg.swipeStartPosition X-Position of touch start.
     * @param {number} arg.swipeEndPosition X-Position of touch end.
     * @return {number} Number of slides to increment carousel.
     */
    calculateTouchSlideIncrement({ swipeStartPosition, swipeEndPosition }) {
      const swipeDiff = swipeEndPosition - swipeStartPosition
      const itemWidth = this.carouselWidth / this.visibleSlideCount
      let increment = 0
      if (swipeDiff / itemWidth < 0.5 && swipeDiff / itemWidth > -0.5) {
        const quickSwipeTime =
          this.touchEvent.endTimeStamp - this.touchEvent.startTimeStamp
        if (quickSwipeTime < 700) {
          increment = swipeDiff / itemWidth < 0 ? 1 : -1
        }
      } else {
        increment = -Math.round(swipeDiff / itemWidth)
      }
      return increment
    },
    /**
     * Set the current slide using the direction and current
     * active slide.
     * @param {number} increment Number of slides the pagination should
     * increment by.
     */
    handlePagination(increment) {
      if (increment < 0) {
        // Handle move to previous slide.
        if (this.currentSlide + increment > 0) {
          this.setCurrentSlide(Math.floor(this.currentSlide + increment))
        } else {
          this.setCurrentSlide(0)
        }
      } else {
        // Handle move to next slide.
        if (
          (isTrue(this.sliderConfig.showEmptySpace) &&
            this.currentSlide + increment < this.slideCount) ||
          this.currentSlide + increment <
            this.slideCount - this.visibleSlideCount
        ) {
          this.setCurrentSlide(this.currentSlide + increment)
        } else if (
          !isTrue(this.sliderConfig.showEmptySpace) &&
          this.currentSlide + increment >=
            this.slideCount - Math.floor(this.visibleSlideCount)
        ) {
          this.setCurrentSlide(
            this.slideCount - Math.floor(this.visibleSlideCount)
          )
        }
      }
    },
    /**
     * Set the current slide using the increment param and current
     * active slide. This method should be used if the carousel
     * is set to loop. The carousel will disable animation whilst
     * changing to a slide if the carousel needs to reset to the start
     * or end.
     * @param {number} increment Number of slides the carousel should increment by.
     */
    handlePaginationWithLoop(increment) {
      if (this.isSkippingSlides) return

      if (increment < 0) {
        if (this.currentSlide + increment < Math.ceil(this.visibleSlideCount)) {
          this.isSkippingSlides = true
          this.$refs.cycle.addEventListener(
            'transitionend',
            () => {
              this.skipToSlide(this.slideCount + this.currentSlide)
            },
            { once: true }
          )
        }
        this.setCurrentSlide(this.currentSlide + increment)
      } else {
        if (
          this.currentSlide + increment >
          this.slideCount + Math.ceil(this.visibleSlideCount) - 1
        ) {
          this.isSkippingSlides = true
          this.$refs.cycle.addEventListener(
            'transitionend',
            () => {
              this.skipToSlide(this.currentSlide - this.slideCount)
            },
            { once: true }
          )
        }
        this.setCurrentSlide(this.currentSlide + increment)
      }
    },
    /**
     * Change active slide in carousel without animating.
     * @param {number} slide The slide to set as active.
     */
    async skipToSlide(slide) {
      this.isSkippingSlides = true
      this.disableAnimation()
      await this.$nextTick()
      this.setCurrentSlide(slide)
      await this.$nextTick()
      this.enableAnimation()
      this.isSkippingSlides = false
    },
    /**
     * Prevent the carousel transition from animating.
     */
    disableAnimation() {
      this.disableTransition = true
    },
    /**
     * Enable the carousel transition to animate.
     */
    enableAnimation() {
      this.disableTransition = false
    },
    /**
     * Check if carousel button should be disabled.
     * @param {string} button 'prev' or 'next'
     */
    isButtonDisabled(button) {
      if (isTrue(this.sliderConfig.loop)) return false

      if (this.currentSlide === 0 && button === 'prev') return true
      if (
        (!isTrue(this.sliderConfig.showEmptySpace) &&
          this.currentSlide === this.slideCount - this.visibleSlideCount &&
          button === 'next') ||
        (isTrue(this.sliderConfig.showEmptySpace) &&
          this.currentSlide === this.slideCount - 1 &&
          button === 'next')
      )
        return true
    },
    /**
     * On pagination button click, set the current slide.
     * The page value is decremented to make it base-0 as the
     * pagination is base-1 but the carousel is base-0.
     * @param {number} page The page number in base-1.
     */
    onPaginationButtonClick(page) {
      if (isTrue(this.sliderConfig.loop)) {
        this.setCurrentSlide(page - 1 + Math.ceil(this.visibleSlideCount))
      } else {
        this.setCurrentSlide(page - 1)
      }
    }
  }
}
</script>

<style lang="scss">
.v-carousel {
  position: relative;

  // Fallback slide width styles
  &:not(.v-carousel--static) {
    .v-carousel__slide {
      width: 100%;
      min-width: 100%;
    }
  }

  &--draggable {
    cursor: grab;

    button,
    a {
      cursor: pointer;
    }
  }
}

.v-carousel__wrap {
  overflow: hidden;
}

.v-carousel__cycle {
  display: flex;
  transition: transform ease 0.5s;
}

.v-carousel__controls__btn {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  z-index: 10;

  &--next {
    left: auto;
    right: 0;
  }

  &--disabled {
    pointer-events: none;
    opacity: 0.2;
  }
}

// Default padding can be overwritten by props
.v-carousel__slide {
  box-sizing: border-box;
  padding-left: 8px;
  padding-right: 8px;
}

// Give slides even width when static
.v-carousel--static {
  overflow: initial;

  .v-carousel__slide {
    flex-grow: 1;
    flex-basis: 0;
  }
}
</style>
