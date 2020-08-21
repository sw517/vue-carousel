<template>
  <div
    ref="v-carousel"
    class="v-carousel"
    :class="[{ 'v-carousel--static': isStatic }]"
  >
    <div ref="cycle" :style="cCycleStyles" class="v-carousel__cycle">
      <div
        v-for="(slot, index) in cSlideList"
        :key="index"
        :style="cSlideStyles"
        class="v-carousel__slide"
      >
        <slot :name="slot" />
      </div>
    </div>
    <div class="v-carousel__pagination">
      <!-- <PaginationButtons
        v-if="!isStatic && visibleSlides !== Object.keys($slots).length"
        @pagination-click="setCurrentSlide"
        :buttonCount="slideCount"
        :activeButton="currentSlide"
        :isWhite="sliderConfig.whitePagination"
      /> -->
    </div>
  </div>
</template>

<script>
// Helpers
import merge from 'lodash.merge';
import isTrue from '@/scripts/helpers/isTrue';
// Components
// import PaginationButtons from "@/components/molecules/pagination-buttons/PaginationButtons.vue";

export default {
  name: 'VueCarousel',
  components: {
    // PaginationButtons
  },
  props: {
    config: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      breakpoints: {
        xs: 0,
        sm: 600,
        md: 980,
        lg: 1200,
        xl: 1600,
      },
      carouselWidth: null,
      currentBreakpoint: 'xs',
      currentSlide: 0,
      currentWindowWidth: 0,
      disableTransition: false,
      dragPosition: null,
      isSkippingSlides: false,
      isStatic: false,
      slideCount: Object.keys(this.$slots).length,
      sliderConfig: {},
      touchEvent: {
        swipeStartPosition: null,
        swipeEndPosition: null,
        swipeMovePosition: null,
        startTimeStamp: null,
        endTimeStamp: null,
        moveTimeStamp: null,
      },
      visibleSlides: 1,
    };
  },
  computed: {
    cSlideList() {
      const slides = [];
      const visibleSlides = Math.ceil(this.visibleSlides);
      for (let i = 0; i < this.slideCount; i += 1) slides.push(i);

      if (!this.sliderConfig.loop) {
        return slides;
      } else {
        const prefixSlides = [];
        const suffixSlides = [];
        for (
          let i = this.slideCount - 1;
          i >= this.slideCount - visibleSlides;
          i -= 1
        )
          prefixSlides.unshift(i);

        for (let i = 0; i <= visibleSlides; i += 1) suffixSlides.push(i);

        return [...prefixSlides, ...slides, ...suffixSlides];
      }
    },
    /**
     * Returns the CSS Styles for the individual slides.
     * Only styles the slides if not static.
     */
    cSlideStyles() {
      return {
        minWidth: this.isStatic ? null : `${100 / this.visibleSlides}%`,
        width: this.isStatic ? null : `${100 / this.visibleSlides}%`,
        paddingLeft: this.getSlidePadding(this.sliderConfig.slidePadding),
        paddingRight: this.getSlidePadding(this.sliderConfig.slidePadding),
      };
    },
    /**
     * Returns the CSS Styles for the carousel cycle.
     * Only styles if not static.
     */
    cCycleStyles() {
      if (this.isStatic) return null;

      let transform;

      if (this.dragPosition) {
        transform =
          (this.currentSlide * this.carouselWidth) / this.visibleSlides -
          this.dragPosition;
      } else {
        transform =
          (this.currentSlide * this.carouselWidth) / this.visibleSlides;
      }
      return {
        transform: `translateX(-${transform}px)`,
        transition: this.disableTransition || this.dragPosition ? 'none' : null,
      };
    },
  },
  watch: {
    currentWindowWidth() {
      this.setCurrentBreakpoint();
      this.setCarouselWidth();
    },
    currentBreakpoint() {
      this.setVisibleSlides(this.sliderConfig.slidesVisible);
      this.setIsStatic();
    },
  },
  created() {
    this.setUpConfig();
    this.setSlideCount();
  },
  mounted() {
    this.recordCurrentWindowWidth();
    this.setCurrentBreakpoint();
    this.setIsStatic();
    this.setCarouselWidth();
    this.setVisibleSlides(this.sliderConfig.slidesVisible);

    if (isTrue(this.sliderConfig.loop)) {
      this.setCurrentSlide(Math.ceil(this.visibleSlides));
    } else {
      this.setCurrentSlide(0);
    }

    this.addTouchEventListeners();
    this.addResizeListener();
  },
  updated() {
    this.setSlideCount();
    this.setCarouselWidth();
  },
  methods: {
    /**
     * Merges default slider config and custom props config
     * into one configuration object used by the component.
     */
    setUpConfig() {
      const defaultConfig = () => ({
        loop: true,
        slidePadding: {
          xs: null,
          sm: null,
          md: null,
          lg: null,
          xl: null,
        },
        slidesVisible: {
          xs: 1,
          sm: null,
          md: null,
          lg: null,
          xl: null,
        },
        staticBreakpoint: null,
        whitePagination: false,
      });
      this.sliderConfig = Object.assign(
        {},
        merge(defaultConfig(), this.$props.config),
      );
    },
    /**
     * Apply a resize event listener to update the current
     * window width and breakpoint.
     */
    addResizeListener() {
      if (window) {
        window.addEventListener('resize', () => {
          this.recordCurrentWindowWidth();
        });
      }
    },
    /**
     * Records the current width of documentElement.
     */
    recordCurrentWindowWidth() {
      this.currentWindowWidth = document.documentElement.clientWidth;
    },
    /**
     * Filter breakpoints to find current breakpoint using
     * currentWindowWidth.
     */
    setCurrentBreakpoint() {
      const { currentWindowWidth, breakpoints } = this;
      const { sm, md, lg, xl } = breakpoints;

      // Do not change order as the find() function will return
      // the first breakpoint that matches its conditions.
      const breakpointsArray = [
        { breakpoint: 'xl', min: xl },
        { breakpoint: 'lg', min: lg },
        { breakpoint: 'md', min: md },
        { breakpoint: 'sm', min: sm },
        { breakpoint: 'xs', min: 0 },
      ];

      const currentBreakpointObject = breakpointsArray.find(
        breakpointObject => {
          return currentWindowWidth >= breakpointObject.min;
        },
      );
      this.currentBreakpoint = currentBreakpointObject.breakpoint;
    },
    setCurrentSlide(slideNumber) {
      this.currentSlide = slideNumber;
    },
    setSlideCount() {
      this.slideCount = Object.keys(this.$slots).length;
    },
    /**
     * Set the width of the carousel as a data property. This is
     * used to calculate the carousel transformation.
     * Called on mounted() and on window resize.
     */
    setCarouselWidth() {
      this.carouselWidth = this.$refs['v-carousel'].clientWidth;
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
    setVisibleSlides({ xs, sm, md, lg, xl }) {
      switch (this.currentBreakpoint) {
        case 'xl':
          this.visibleSlides = xl || lg || md || sm || xs;
          break;
        case 'lg':
          this.visibleSlides = lg || md || sm || xs;
          break;
        case 'md':
          this.visibleSlides = md || sm || xs;
          break;
        case 'sm':
          this.visibleSlides = sm || xs;
          break;
        default:
          this.visibleSlides = xs; // Set to 1 by default in props
          break;
      }
    },
    /**
     * Gets the current breakpoint and slider config to
     * detirmine whether the slider should be static or able to slide.
     * This component is built mobile first so if only mobile
     * is set, this will also affect tablet and desktop.
     */
    setIsStatic() {
      let isStatic = false;

      switch (this.currentBreakpoint) {
        case 'xl':
          isStatic = ['xs', 'sm', 'md', 'lg', 'xl'].includes(
            this.sliderConfig.staticBreakpoint,
          );
          break;
        case 'lg':
          isStatic = ['xs', 'sm', 'md', 'lg'].includes(
            this.sliderConfig.staticBreakpoint,
          );
          break;
        case 'md':
          isStatic = ['xs', 'sm', 'md'].includes(
            this.sliderConfig.staticBreakpoint,
          );
          break;
        case 'sm':
          isStatic = ['xs', 'sm'].includes(this.sliderConfig.staticBreakpoint);
          break;
        default:
          isStatic = ['xs'].includes(this.sliderConfig.staticBreakpoint);
          break;
      }

      this.isStatic = isStatic;
    },
    /**
     * Gets the current breakpoint and slider config to
     * detirmine the padding for each slide. This component is built
     * mobile first so if only mobile or tablet padding is set, this
     * will affect laptop and desktop too.
     * Unit must be included i.e '10px' or '1rem'
     * @param {string} arg.xs Slide padding at mobile
     * @param {string} arg.sm Slide padding at tablet
     * @param {string} arg.md Slide padding at laptop
     * @param {string} arg.lg Slide padding at desktop
     * @param {string} arg.xl Slide padding at large desktop (1600px)
     */
    getSlidePadding({ xs, sm, md, lg, xl }) {
      let padding = null;

      switch (this.currentBreakpoint) {
        case 'xl':
          padding = xl || lg || md || sm || xs;
          break;
        case 'lg':
          padding = lg || md || sm || xs;
          break;
        case 'md':
          padding = md || sm || xs;
          break;
        case 'sm':
          padding = sm || xs;
          break;
        default:
          padding = xs;
          break;
      }
      return padding;
    },
    /**
     * Uses data properties on the component to store co-ordinates
     * and timestamps to detirmine the direction of the touch swipe.
     */
    addTouchEventListeners() {
      const carousel = this.$refs['v-carousel'];

      carousel.addEventListener('touchstart', e => {
        this.touchEvent.swipeStartPosition = e.changedTouches['0'].pageX;
        this.touchEvent.startTimeStamp = e.timeStamp;
      });

      carousel.addEventListener('touchend', e => {
        this.touchEvent.swipeEndPosition = e.changedTouches['0'].pageX;
        this.touchEvent.endTimeStamp = e.timeStamp;
        this.handleTouchEvent();
      });

      carousel.addEventListener(
        'touchmove',
        e => {
          e.preventDefault();
          this.touchEvent.swipeMovePosition =
            e.changedTouches['0'].pageX - this.touchEvent.swipeStartPosition;
          this.touchEvent.moveTimeStamp = e.timeStamp;
          this.handleTouchEvent();
        },
        { passive: false },
      );
    },
    /**
     * Handle logic from touch end and move events.
     * If user is still dragging the carousel cycle, update the drag position,
     * else handle updating the pagination.
     */
    handleTouchEvent() {
      // Do not allow swiping if carousel is in the process of skipping
      // slides as this will cause the carousel to swipe past last slide.
      if (this.isSkippingSlides) return;

      if (
        !this.touchEvent.endTimeStamp ||
        this.touchEvent.endTimeStamp < this.touchEvent.moveTimeStamp
      ) {
        this.setDragPosition(this.touchEvent.swipeMovePosition);
      } else {
        this.handleTouchSlide();
      }
    },
    /**
     * Set the distance of how far user has dragged with touch event.
     * @param {number} position Distance in pixels the carousel cycle is dragged.
     */
    setDragPosition(position) {
      this.dragPosition = position;
    },
    /**
     * Handle the logic for moving the carousel cycle based on user touch slide.
     * The method will check if the user dragged the cycle for the allowed
     * amount of time and decide which method to handle pagination based on
     * if the carousel is looped.
     */
    handleTouchSlide() {
      // Reset drag position to prevent inteference.
      this.setDragPosition(null);
      const startPos = this.touchEvent.swipeStartPosition;
      const endPos = this.touchEvent.swipeEndPosition;

      // Return if touch was not a long enough full swipe.
      if (Math.abs(startPos - endPos) <= 10) return;

      const allowedTime = 2000;
      const swipeTime =
        this.touchEvent.endTimeStamp - this.touchEvent.startTimeStamp;

      if (swipeTime < allowedTime) {
        const increment = this.calculateTouchSlideIncrement(this.touchEvent);

        if (isTrue(this.sliderConfig.loop)) {
          this.handlePaginationWithLoop(increment);
        } else {
          this.handlePagination(increment);
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
      const swipeDiff = swipeEndPosition - swipeStartPosition;
      const itemWidth = this.carouselWidth / this.visibleSlides;
      let increment = 0;
      if (swipeDiff / itemWidth < 0.5 && swipeDiff / itemWidth > -0.5) {
        const quickSwipeTime =
          this.touchEvent.endTimeStamp - this.touchEvent.startTimeStamp;
        if (quickSwipeTime < 700) {
          increment = swipeDiff / itemWidth < 0 ? 1 : -1;
        }
      } else {
        increment = -Math.round(swipeDiff / itemWidth);
      }
      return increment;
    },
    /**
     * Set the current slide using the direction and current
     * active slide.
     * @param {number} increment Number of slides the pagination should
     * increment by.
     */
    handlePagination(increment) {
      if (increment < 0) {
        if (this.currentSlide + increment > 0) {
          this.setCurrentSlide(this.currentSlide + increment);
        } else {
          this.setCurrentSlide(0);
        }
      } else {
        if (
          this.currentSlide + increment <
          this.slideCount - this.visibleSlides
        ) {
          this.setCurrentSlide(this.currentSlide + increment);
        } else {
          this.setCurrentSlide(this.slideCount - this.visibleSlides);
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
      if (increment < 0) {
        if (this.currentSlide + increment < Math.ceil(this.visibleSlides)) {
          this.isSkippingSlides = true;
          this.$refs.cycle.addEventListener(
            'transitionend',
            () => {
              this.skipToSlide(this.slideCount + this.currentSlide);
            },
            { once: true },
          );
        }
        this.setCurrentSlide(this.currentSlide + increment);
      } else {
        if (
          this.currentSlide + increment >
          this.slideCount + Math.ceil(this.visibleSlides) - 1
        ) {
          this.isSkippingSlides = true;
          this.$refs.cycle.addEventListener(
            'transitionend',
            () => {
              this.skipToSlide(this.currentSlide - this.slideCount);
            },
            { once: true },
          );
        }
        this.setCurrentSlide(this.currentSlide + increment);
      }
    },
    /**
     * Change active slide in carousel without animating.
     * @param {number} slide The slide to set as active.
     */
    skipToSlide(slide) {
      this.isSkippingSlides = true;
      this.disableAnimation();
      this.$nextTick().then(() => {
        this.setCurrentSlide(slide);
        this.$nextTick().then(() => {
          this.enableAnimation();
          this.isSkippingSlides = false;
        });
      });
    },
    /**
     * Prevent the carousel transition from animating.
     */
    disableAnimation() {
      this.disableTransition = true;
    },
    /**
     * Enable the carousel transition to animate.
     */
    enableAnimation() {
      this.disableTransition = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.v-carousel {
  overflow: hidden;

  // Fallback slide width styles
  &:not(.v-carousel--static) {
    .v-carousel__slide {
      width: 100%;
      min-width: 100%;
    }
  }
}

.v-carousel__cycle {
  display: flex;
  transition: transform ease 0.5s;
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
