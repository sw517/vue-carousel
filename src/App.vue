<template>
  <div id="app">
    <VueCarousel
      :config="{
        loop,
        mouseDrag: false,
        showEmptySpace: false,
        autoplay,
        controls: {
          showPagination
        },
        slidesVisible: {
          xs: 2,
          sm: 3.5,
          md: 5
        }
      }"
    >
      <template v-for="n in Number(slideCount)" v-slot:[n-1]>
        <a href="/" :key="n - 1">
          <img src="./assets/logo.png" alt="Logo" />
          <div>{{ n }}</div>
        </a>
      </template>
      <template v-slot:previous><span>Previous</span></template>
      <template v-slot:next><span>Next</span></template>
    </VueCarousel>
    <input type="checkbox" v-model="loop" />
    <input type="checkbox" v-model="autoplay" />
    <input type="Number" v-model="slideCount" />
    <input type="checkbox" v-model="showPagination" />
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
      slideCount: 10,
      showPagination: false
    }
  }
}
</script>

<style lang="scss">
#app {
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
