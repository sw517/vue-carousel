<template>
  <div id="app">
    <VueCarousel
      :config="{
        loop: false,
        autoSlide: true,
        slidesVisible: {
          xs: 2,
          sm: 3.5,
          md: 5
        }
      }"
    >
      <template v-for="n in 10" v-slot:[n-1]>
        <div :key="n - 1">
          <img src="./assets/logo.png" alt="Logo" />
          <div>{{ n }}</div>
        </div>
      </template>
      <template v-slot:previous><span>Previous</span></template>
      <template v-slot:next><span>Next</span></template>
    </VueCarousel>
  </div>
</template>

<script>
import VueCarousel from './components/VueCarousel.vue'

export default {
  name: 'App',
  components: {
    VueCarousel
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
