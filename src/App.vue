<template>
  <div id="app">
    <VueCarousel
      :config="{
        debug: true,
        mouseDrag: true,
        center: false,
        startingSlide,
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
    <input type="number" v-model="startingSlide" />
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
      slideCount: 10,
      startingSlide: 2
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
