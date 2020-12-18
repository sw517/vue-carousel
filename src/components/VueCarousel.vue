<template>
  <div
    :class="[
      {
        'v-carousel--static': isStatic,
        'v-carousel--draggable': isTrue(sliderConfig.mouseDrag)
      }
    ]"
    class="v-carousel"
  >
    <div v-if="cShowControls" class="v-carousel__controls">
      <template v-if="cShowButtons">
        <VueCarouselButton
          ref="prev"
          :style="sliderConfig.controls.buttonStyles"
          :class="{
            'v-carousel__controls__btn--disabled': isButtonDisabled('prev')
          }"
          :tabindex="isButtonDisabled('prev') ? -1 : 0"
          class="v-carousel__controls__btn v-carousel__controls__btn--prev"
          aria-label="Previous Slide"
          @click.native="handleIncrementButtonClick(-1)"
        >
          <slot name="previous">
            <span v-html="sliderConfig.controls.previous" />
          </slot>
        </VueCarouselButton>
        <VueCarouselButton
          ref="next"
          :style="sliderConfig.controls.buttonStyles"
          :class="{
            'v-carousel__controls__btn--disabled': isButtonDisabled('next')
          }"
          :tabindex="isButtonDisabled('next') ? -1 : 0"
          class="v-carousel__controls__btn v-carousel__controls__btn--next"
          aria-label="Next Slide"
          @click.native="handleIncrementButtonClick(1)"
        >
          <slot name="next">
            <span v-html="sliderConfig.controls.next" />
          </slot>
        </VueCarouselButton>
      </template>
      <VueCarouselButton
        v-if="cShowPlayButton"
        :style="sliderConfig.controls.buttonStyles"
        :aria-label="cPlayAriaLabel"
        class="v-carousel__controls__btn v-carousel__controls__btn--play"
        @click.native="handlePlayButtonClick"
      >
        <slot name="play">
          <span v-html="cPlayButtonContent" />
        </slot>
      </VueCarouselButton>
      <VueCarouselPagination
        v-if="cShowPagination"
        :count="cPaginationCount"
        :current="cPaginationCurrent"
        :button-styles="sliderConfig.controls.paginationStyles"
        :numbered="sliderConfig.controls.paginationNumbered"
        @pagination-click="onPaginationButtonClick"
      />
    </div>
    <div
      ref="cycle-wrap"
      class="v-carousel__wrap"
      @mouseenter="onMouseOver"
      @mouseleave="onMouseOut"
      @mousedown="onMouseOver"
      @mouseup="onMouseOut"
    >
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
  </div>
</template>

<script>
// Helpers
import merge from 'lodash.merge'
import cloneDeep from 'lodash.clonedeep'
import isTrue from '../scripts/helpers/isTrue'
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
      manuallyPaused: false,
      observer: null,
      slideCount: this.setSlideCount(),
      sliderConfig: {},
      startingSlide: 0,
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
    /**
     * Returns the CSS Styles for the carousel cycle.
     * Only styles if not static.
     */
    cCycleStyles() {
      if (this.isStatic) return null

      let transform, transition
      let slideWidth = this.carouselWidth / this.visibleSlideCount
      const { transitionDuration, transitionTimingFunction } = this.sliderConfig

      if (this.dragPosition) {
        transform = -(this.currentSlide * slideWidth - this.dragPosition)
      } else {
        transform = -(this.currentSlide * slideWidth)
        transition = `transform ${transitionDuration}ms ${transitionTimingFunction}`
      }

      if (isTrue(this.sliderConfig.center)) {
        const offset = this.carouselWidth / 2 - slideWidth / 2
        transform = transform + offset
      }

      return {
        transform: `translateX(${transform}px)`,
        transition:
          this.disableTransition || this.dragPosition ? 'none' : transition
      }
    },
    cCanIncrementToLast() {
      return (
        isTrue(this.sliderConfig.center) ||
        isTrue(this.sliderConfig.showEmptySpace)
      )
    },
    cPaginationCount() {
      return this.cCanIncrementToLast ||
        isTrue(this.sliderConfig.loop) ||
        isTrue(this.sliderConfig.center)
        ? this.slideCount
        : this.slideCount - Math.floor(this.visibleSlideCount) + 1
    },
    /**
     * Returns current slide for pagination component.
     * Converts currentSlide (base-zero) into base-one for the
     * pagination so starting page is 1.
     */
    cPaginationCurrent() {
      if (isTrue(this.sliderConfig.loop)) {
        return this.currentSlide - Math.ceil(this.visibleSlideCount) + 1
      } else {
        return this.currentSlide + 1
      }
    },
    cPlayAriaLabel() {
      if (this.autoplayIntervalId) {
        return 'Pause Carousel'
      } else {
        return 'Play Carousel'
      }
    },
    cPlayButtonContent() {
      if (this.autoplayIntervalId) {
        return this.sliderConfig.controls.pause
      } else {
        return this.sliderConfig.controls.play
      }
    },
    cShowButtons() {
      return isTrue(this.sliderConfig.controls.showButtons)
    },
    cShowControls() {
      return (
        !this.isStatic &&
        (this.cShowButtons || this.cShowPagination || this.cShowPlayButton)
      )
    },
    cShowPagination() {
      return (
        this.slideCount > 0 && isTrue(this.sliderConfig.controls.showPagination)
      )
    },
    cShowPlayButton() {
      return (
        isTrue(this.sliderConfig.autoplay) &&
        isTrue(this.sliderConfig.controls.showPlay)
      )
    },
    /**
     * Returns an array of numbers where each number represents
     * a v-slot. We sandwich the numbers 0-{slide-count} with
     * a repeat of numbers to give an illusion of an infinite array.
     * E.g [4,5,6,0,1,2,3,4,5,6,0,1,2,3]
     */
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

      for (let i = 0; i < Math.ceil(visibleSlideCount); i += 1)
        suffixSlides.push(i)

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
      async handler() {
        this.removeAutoplayInterval()
        this.removeTouchDragListeners()
        this.removeMouseDragListeners()
        this.removeIntersectionObserver()
        this.setUpConfig()
        // Wait for setSlideCount in updated() hook.
        await this.$nextTick()
        this.prepareCarousel()
        this.skipToSlide(this.startingSlide)
      },
      deep: true
    }
  },
  created() {
    this.setUpConfig()
    this.setSlideCount()
  },
  mounted() {
    this.recordCurrentWindowWidth()
    this.prepareCarousel()
    this.setCurrentSlide(this.startingSlide)
    this.addResizeListener()
  },
  updated() {
    this.setSlideCount()
    this.setCarouselWidth()
  },
  beforeDestroy() {
    this.removeResizeListener()
    this.removeTouchDragListeners()
    this.removeMouseDragListeners()
    this.removeAutoplayInterval()
    this.removeIntersectionObserver()
  },
  methods: {
    isTrue,
    /**
     * Uses data properties on the component to store co-ordinates
     * and timestamps to detirmine the direction of the mouse drag.
     */
    addMouseDragListeners() {
      const carousel = this.$refs['cycle-wrap']

      carousel.addEventListener('mousedown', this.recordPressDownStart)
      carousel.addEventListener('mouseup', this.recordPressDownEnd)
      carousel.addEventListener('mousemove', this.recordPressDownMove)
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
     * Uses data properties on the component to store co-ordinates
     * and timestamps to detirmine the direction of the touch swipe.
     */
    addTouchDragListeners() {
      const carousel = this.$refs['cycle-wrap']

      carousel.addEventListener('touchstart', this.recordPressDownStart)
      carousel.addEventListener('touchend', this.recordPressDownEnd)
      carousel.addEventListener('touchmove', this.recordPressDownMove, {
        passive: false
      })
    },
    /**
     * Increment the current slide by 1. If loop is disabled, reset
     * the current slide to the first slide when the carousel reaches
     * the last slide.
     */
    autoIncrement() {
      if (this.sliderConfig.loop) {
        this.handleIncrementWithLoop(1)
      } else {
        if (
          this.currentSlide + 1 <=
          this.slideCount - Math.floor(this.visibleSlideCount)
        ) {
          this.handleIncrement(1)
        } else {
          this.setCurrentSlide(0)
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
    debug(msg) {
      if (isTrue(this.sliderConfig.debug)) {
        console.warn(
          `%c@samwood/vue-carousel%c\n\n${msg}`,
          'background: #5fc59d; padding: 2px 4px;',
          ''
        )
      }
    },
    /**
     * Prevent the carousel transition from animating.
     */
    disableAnimation() {
      this.disableTransition = true
    },
    /**
     * Emit the slide-change event with the new slide index.
     * The slide index will be translated to the v-slot index
     * if loop is true.
     * @event slide-change
     * @property {number} slide The new slide index.
     */
    emitSlideChange(slide) {
      if (isTrue(this.sliderConfig.loop)) {
        this.$emit('slide-change', slide - Math.ceil(this.visibleSlideCount))
      } else {
        this.$emit('slide-change', slide)
      }
    },
    /**
     * Enable the carousel transition to animate.
     */
    enableAnimation() {
      this.disableTransition = false
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
    handleIncrementButtonClick(increment) {
      if (isTrue(this.sliderConfig.loop)) {
        this.handleIncrementWithLoop(increment)
      } else {
        this.handleIncrement(increment)
      }

      // If button becomes disabled, remove focus.
      if (increment === -1 && this.isButtonDisabled('prev')) {
        this.$refs.prev.$el.blur()
      } else if (increment === 1 && this.isButtonDisabled('next')) {
        this.$refs.next.$el.blur()
      }
    },
    /**
     * Set the current slide using the direction and current
     * active slide.
     * @param {number} increment Number of slides the pagination should
     * increment by.
     */
    handleIncrement(increment) {
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
          (this.cCanIncrementToLast &&
            this.currentSlide + increment < this.slideCount) ||
          this.currentSlide + increment <
            this.slideCount - this.visibleSlideCount
        ) {
          this.setCurrentSlide(this.currentSlide + increment)
        } else if (
          !this.cCanIncrementToLast &&
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
    handleIncrementWithLoop(increment) {
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
     * When carousel is visible, add the autoplay interval.
     * If the carousel is not on screen, remove autoplay interval
     * to reduce the load on the browser.
     */
    handleIntersect(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.setAutoplayInterval()
        } else {
          this.removeAutoplayInterval()
        }
      })
    },
    /**
     * If autoplay is currently enabled, remove the interval
     * on click to pause the carousel, else re-add the interval
     * if autoplay is paused.
     */
    handlePlayButtonClick() {
      if (this.autoplayIntervalId) {
        this.manuallyPaused = true
        this.removeAutoplayInterval()
      } else {
        this.manuallyPaused = false
        this.setAutoplayInterval()
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
          this.handleIncrementWithLoop(increment)
        } else {
          this.handleIncrement(increment)
        }
      }
    },
    /**
     * Check if carousel button should be disabled.
     * @param {string} button 'prev' or 'next'
     */
    isButtonDisabled(button) {
      if (isTrue(this.sliderConfig.loop)) return false

      if (this.currentSlide === 0 && button === 'prev') return true
      if (
        (!this.cCanIncrementToLast &&
          this.currentSlide === this.slideCount - this.visibleSlideCount &&
          button === 'next') ||
        (this.cCanIncrementToLast &&
          this.currentSlide === this.slideCount - 1 &&
          button === 'next')
      )
        return true
    },
    /**
     * On mouseout, if autoplayHoverPause is set to true, re-add
     * the setInterval for autoplay which would have been removed
     * on mouseover (only if carousel is not manually paused).
     */
    onMouseOut() {
      if (isTrue(this.sliderConfig.autoplayHoverPause)) {
        this.setAutoplayInterval()
      }
    },
    /**
     * On mouseover, if autoplayHoverPause is set to true, remove
     * the setInterval for autoplay. This will be re-added on mouseout.
     */
    onMouseOver() {
      if (isTrue(this.sliderConfig.autoplayHoverPause)) {
        this.removeAutoplayInterval()
      }
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
    },
    /**
     * Bundles methods for initialising carousel properties.
     * Method can be called when props are updated.
     * The order of calling bundled methods is important!
     */
    prepareCarousel() {
      this.setCurrentBreakpoint()
      this.setSlideCount()
      this.setIsStatic()
      this.setCarouselWidth()
      this.setVisibleSlideCount(this.sliderConfig.slidesVisible)
      this.setStartingSlide()

      if (isTrue(this.sliderConfig.touchDrag)) {
        this.addTouchDragListeners()
      }

      if (isTrue(this.sliderConfig.mouseDrag)) {
        this.addMouseDragListeners()
      }

      if (isTrue(this.sliderConfig.autoplay)) {
        this.setAutoplayInterval()
        this.setIntersectionObserver()
      }
    },
    /**
     * Records the current width of documentElement.
     */
    recordCurrentWindowWidth() {
      this.currentWindowWidth = document.documentElement.clientWidth
    },
    /**
     * Record the position and timestamp of the mousedown or touchstart event.
     * @param {event} e mousedown or touchstart event.
     */
    recordPressDownStart(e) {
      // Touch event uses changedTouches, mousedown does not.
      e.preventDefault()
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
        this.setAutoplayInterval()
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
     * Remove the intersection observer from the carousel.
     */
    removeIntersectionObserver() {
      if (this.observer) {
        this.observer.unobserve(this.$el)
      }
    },
    /**
     * Remove the mouse event listeners to ensure they are not duplicated
     * when the config prop updates and the watcher resets the carousel.
     */
    removeMouseDragListeners() {
      const carousel = this.$refs['cycle-wrap']

      carousel.removeEventListener('mousedown', this.recordPressDownStart)
      carousel.removeEventListener('mouseup', this.recordPressDownEnd)
      carousel.addEventListener('mousemove', this.recordPressDownMove)
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
     * Remove the touch event listeners to ensure they are not duplicated
     * when the config prop updates and the watcher resets the carousel.
     */
    removeTouchDragListeners() {
      const carousel = this.$refs['cycle-wrap']

      carousel.removeEventListener('touchstart', this.recordPressDownStart)
      carousel.removeEventListener('touchend', this.recordPressDownEnd)
      carousel.removeEventListener('touchmove', this.recordPressDownMove, {
        passive: false
      })
    },
    /**
     * If autoplay is true, set an interval to automatically
     * increment the current slide.
     */
    setAutoplayInterval() {
      if (
        !this.autoplayIntervalId &&
        isTrue(this.sliderConfig.autoplay) &&
        !this.manuallyPaused
      ) {
        this.autoplayIntervalId = setInterval(
          this.autoIncrement,
          this.sliderConfig.autoplayInterval
        )
      }
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
    /**
     * Set the width of the carousel as a data property. This is
     * used to calculate the carousel transformation.
     * Called on mounted() and on window resize.
     */
    setCarouselWidth() {
      this.carouselWidth = this.$refs['cycle-wrap'].clientWidth
    },
    /**
     * Set the currenet slide number. This is used for the transform value
     * in the cycle styles. Note - when loop is true, the slideNumber should
     * range from (0 + visibleSlides) to (slideCount - visibleSlides). This is
     * because we add cloned slides either side of the main slides to give a false
     * appearance of infinite slides.
     * @param slideNumber The index of the slide to set as current.
     */
    setCurrentSlide(slideNumber) {
      this.currentSlide = slideNumber
      this.emitSlideChange(slideNumber)
    },
    /**
     * Set the distance of how far user has dragged with touch event.
     * @param {number} position Distance in pixels the carousel cycle is dragged.
     */
    setDragPosition(position) {
      this.dragPosition = position
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
     * Set the intersection observer for the carousel to trigger
     * when visible on screen.
     */
    setIntersectionObserver() {
      let options = {
        rootMargin: '-20px'
      }
      this.observer = new IntersectionObserver(this.handleIntersect, options)
      this.observer.observe(this.$el)
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
     * Set starting slide index for when carousel renders.
     */
    setStartingSlide() {
      this.startingSlide = this.validateStartingSlide(
        this.sliderConfig.startingSlide
      )
    },
    /**
     * Merges default slider config and custom props config
     * into one configuration object used by the component.
     *
     * Validated properties:
     * arg.breakpoints - will use default if invalid
     * arg.slidesVisible - will remove invalid keys from object
     * arg.autoplayInterval - will remove autoplay if invalid
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
        center: false,
        controls: {
          previous: '&lt;',
          next: '&gt;',
          play: 'Play',
          pause: 'Pause',
          buttonStyles: null,
          paginationNumbered: false,
          paginationStyles: null,
          showButtons: true,
          showPagination: false,
          showPlay: false
        },
        debug: false,
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
        startingSlide: 0,
        staticBreakpoint: null,
        touchDrag: true,
        transitionDuration: 500,
        transitionTimingFunction: 'ease'
      })

      // Clone props.config to validate individual properties.
      const clonedPropsConfig = cloneDeep(this.$props.config)

      if (Object.keys(clonedPropsConfig)) {
        /**
         * Breakpoint Validation
         *
         * If any breakpoint is invalid, validateBreakpoints will return false
         * and default will be used.
         */
        clonedPropsConfig.breakpoints = this.validateBreakpoints(
          clonedPropsConfig.breakpoints
        )
          ? clonedPropsConfig.breakpoints
          : defaultConfig().breakpoints

        /**
         * Slides Visible Validation
         *
         * validateSlidesVisible will remove individual breakpoints if invalid or
         * return an empty object if all are invalid or not set.
         */
        const validatedSlidesVisible = this.validateSlidesVisible(
          clonedPropsConfig.slidesVisible
        )

        clonedPropsConfig.slidesVisible = Object.keys(validatedSlidesVisible)
          .length
          ? validatedSlidesVisible
          : defaultConfig().slidesVisible

        /**
         * Autoplay Interval Validation
         *
         * Autoplay will not be enabled if the autoplayInterval is less than
         * the transitionDuration value.
         */
        if (isTrue(clonedPropsConfig.autoplay)) {
          const transitionDuration =
            clonedPropsConfig.transitionDuration ||
            defaultConfig().transitionDuration
          const autoplayInterval =
            clonedPropsConfig.autoplayInterval ||
            defaultConfig().autoplayInterval

          if (transitionDuration > autoplayInterval) {
            clonedPropsConfig.autoplay = false
            this.debug(
              `Invalid Config:\n\ntransitionDuration [${transitionDuration}] must be less than or equal to autoplayInterval [${autoplayInterval}] if autoplay is enabled.\n\nDisabling autoplay.`
            )
          }
        }
      }

      this.sliderConfig = Object.assign(
        {},
        merge(defaultConfig(), clonedPropsConfig)
      )
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

          this.debug(
            'Invalid breakpoints. Using default breakpoints instead.',
            '\nconfig.breakpoints: ',
            propsConfig
          )
        } catch (error) {
          this.debug(error)
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
          this.debug(
            `Invalid slidesVisible value. \nconfig.slidesVisible.${key} must be a valid positive number.`
          )
        }
        return acc
      }, {})
    },
    /**
     * Validate the starting slide for when the carousel renders. If loop is
     * true, the starting slide (index) will be translated using visibleSlideCount
     * because the indeces will not match due to cloning slides to give an
     * infinite-loop effect.
     */
    validateStartingSlide(startSlide) {
      // Handle NaN or out of range slide by returning fallback values.
      if (
        (!Number(startSlide) && Number(startSlide) !== 0) ||
        Number(startSlide) < 0 ||
        Number(startSlide) >= this.slideCount
      ) {
        this.debug(
          `Invalid startingSlide value: ${startSlide}. \nconfig.startingSlide must be a number between 0 and ${this
            .slideCount - 1}.`
        )
        if (isTrue(this.sliderConfig.loop)) {
          return Math.ceil(this.visibleSlideCount)
        } else {
          return 0
        }
      }

      // Translate index if carousel is looped or lower index to keep in range if
      // showEmptySpace and center are both false.
      if (isTrue(this.sliderConfig.loop)) {
        return Number(startSlide) + Math.ceil(this.visibleSlideCount)
      } else if (
        !this.cCanIncrementToLast &&
        Number(startSlide) > this.slideCount - Math.ceil(this.visibleSlideCount)
      ) {
        this.debug(
          `Invalid startingSlide value: ${startSlide}. \nconfig.center and config.showEmptySpace are false therefore highest index allowed is ${this
            .slideCount - this.visibleSlideCount}.`
        )
        return this.slideCount - Math.ceil(this.visibleSlideCount)
      } else {
        return Number(startSlide)
      }
    }
  }
}
</script>

<style lang="scss">
.v-carousel {
  position: relative;
  display: flex;
  flex-wrap: wrap;

  // Fallback slide width styles
  &:not(.v-carousel--static) {
    .v-carousel__slide {
      width: 100%;
      min-width: 100%;
    }
  }

  &--draggable {
    .v-carousel__cycle {
      cursor: grab;
    }

    .v-carousel__slide {
      user-select: none;
    }
  }
}

.v-carousel__wrap {
  order: 1;
  flex-basis: 100%;
  overflow: hidden;
}

.v-carousel__cycle {
  display: flex;
  transition: transform ease 0.5s;
}

.v-carousel__controls {
  order: 2;
  flex-basis: 100%;
}

.v-carousel__controls__btn {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  z-index: 10;

  &--next {
    left: auto;
    right: 1rem;
  }

  &--play {
    transform: none;
    top: auto;
    bottom: 1rem;
    right: 1rem;
    left: auto;
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
