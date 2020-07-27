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
      isSkippingSlides: false,
      isStatic: false,
      slideCount: Object.keys(this.$slots).length,
      sliderConfig: {},
      touchEvent: {
        swipeStartPosition: null,
        swipeEndPosition: null,
        startTimeStamp: null,
        endTimeStamp: null,
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

      const transform =
        (this.currentSlide * this.carouselWidth) / this.visibleSlides;
      return {
        transform: `translateX(-${transform}px)`,
        transition: this.disableTransition ? 'none' : null,
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
    this.setIsStatic();
    this.setCarouselWidth();
    this.setVisibleSlides(this.sliderConfig.slidesVisible);
    this.setCurrentSlide(Math.ceil(this.visibleSlides));
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
      const { xs, sm, md, lg, xl } = breakpoints;

      // Do not change order as the find() function will return
      // the first breakpoint that matches its conditions.
      const breakpointsArray = [
        { breakpoint: 'xl', min: xl },
        { breakpoint: 'lg', min: lg },
        { breakpoint: 'md', min: md },
        { breakpoint: 'sm', min: sm },
        { breakpoint: 'xs', min: xs },
      ];

      const currentBreakpointObject = breakpointsArray.find(
        breakpointObject => {
          return currentWindowWidth >= breakpointObject.min;
        },
      );
      this.currentBreakpoint = currentBreakpointObject.breakpoint;
    },
    setCurrentSlide(pageNumber) {
      this.currentSlide = pageNumber;
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
     * @param arg.xs {number} Number of slides visible at mobile
     * @param arg.sm {number} Number of slides visible at tablet
     * @param arg.md {number} Number of slides visible at laptop
     * @param arg.lg {number} Number of slides visible at desktop
     * @param arg.xl {number} Number of slides visible at large desktop (1600px)
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
     * @param arg.xs {string} Slide padding at mobile
     * @param arg.sm {string} Slide padding at tablet
     * @param arg.md {string} Slide padding at laptop
     * @param arg.lg {string} Slide padding at desktop
     * @param arg.xl {string} Slide padding at large desktop (1600px)
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
     * Adds the touch-swipe events for mobile.
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
    },
    /**
     * Uses data properties on the component to store co-ordinates
     * and timestamps to detirmine the direction of the touch swipe.
     */
    handleTouchEvent() {
      // Do not allow swiping if carousel is in the process of skipping
      // slides as this will cause the carousel to swipe past last slide.
      if (this.isSkippingSlides) return;

      const startPos = this.touchEvent.swipeStartPosition;
      const endPos = this.touchEvent.swipeEndPosition;
      // Return if touch was not a long enough full swipe.
      if (Math.abs(startPos - endPos) <= 10) return;

      const allowedTime = 2000;
      const swipeTime =
        this.touchEvent.endTimeStamp - this.touchEvent.startTimeStamp;

      if (swipeTime < allowedTime) {
        const direction = startPos < endPos ? 'prev' : 'next';
        if (isTrue(this.sliderConfig.loop)) {
          this.handlePaginationWithLoop(direction);
        } else {
          this.handlePagination(direction);
        }
      }
    },
    handlePagination(direction) {
      if (direction === 'prev') {
        if (this.currentSlide !== 0)
          this.setCurrentSlide(this.currentSlide - 1);
      } else {
        if (this.currentSlide !== this.slideCount - 1)
          this.setCurrentSlide(this.currentSlide + 1);
      }
    },
    handlePaginationWithLoop(direction) {
      if (direction === 'prev') {
        if (this.currentSlide === Math.ceil(this.visibleSlides)) {
          this.isSkippingSlides = true;
          this.setCurrentSlide(this.currentSlide - 1);
          this.$refs.cycle.addEventListener(
            'transitionend',
            () => {
              this.skipToSlide(
                this.slideCount + Math.ceil(this.visibleSlides) - 1,
              );
            },
            { once: true },
          );
        } else {
          this.setCurrentSlide(this.currentSlide - 1);
        }
      } else {
        if (
          this.currentSlide ===
          this.slideCount + Math.ceil(this.visibleSlides) - 1
        ) {
          this.isSkippingSlides = true;
          this.setCurrentSlide(this.currentSlide + 1);
          this.$refs.cycle.addEventListener(
            'transitionend',
            () => {
              this.skipToSlide(Math.ceil(this.visibleSlides));
            },
            { once: true },
          );
        } else {
          this.setCurrentSlide(this.currentSlide + 1);
        }
      }
    },
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
    disableAnimation() {
      this.disableTransition = true;
    },
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
