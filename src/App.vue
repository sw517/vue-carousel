<template>
  <div id="app">
    <VueCarousel
      :config="{
        debug,
        loop,
        mouseDrag: true,
        showEmptySpace: false,
        autoplay,
        touchDrag,
        controls: {
          showPagination,
          showPlay: true
        },
        transitionDuration,
        transitionTimingFunction: 'ease',
        autoplayInterval,
        autoplayHoverPause: false,
        slidesVisible: {
          xs: 2,
          sm: 3.5,
          md: 5
        }
      }"
    >
      <template v-for="n in Number(slideCount)" v-slot:[n-1]>
        <div :key="n - 1">
          <img src="./assets/logo.png" alt="Logo" />
          <div>{{ n }}</div>
        </div>
      </template>
      <template v-slot:previous><span>Previous</span></template>
      <template v-slot:next><span>Next</span></template>
    </VueCarousel>
    <div>Loop</div>
    <input type="checkbox" v-model="loop" />
    <div>Autoplay</div>
    <input type="checkbox" v-model="autoplay" />
    <div>Slidecount</div>
    <input type="Number" v-model="slideCount" />
    <div>Show Pagination</div>
    <input type="checkbox" v-model="showPagination" />
    <div>TouchDrag</div>
    <input type="checkbox" v-model="touchDrag" />
  </div>
</template>

<script>
import VueCarousel from './components/VueCarousel.vue'

export default {
  name: 'App',
  components: {
    VueCarousel
  },
  data() {
    return {
      loop: false,
      autoplay: false,
      debug: true,
      slideCount: 10,
      showPagination: false,
      touchDrag: true,
      autoplayInterval: 2500,
      transitionDuration: 300
    }
  }
}
</script>

<style lang="scss">
#app {
  padding-bottom: 20000px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;

  img {
    max-width: 90px;
  }
}
</style>
