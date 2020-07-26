<template>
  <div id="app">
    <VueCarousel
      :config="{
        slidesVisible: {
          xs: 1.5,
          sm: 2,
          md: 2.5,
        },
      }"
    >
      <template v-for="n in 10" v-slot:[n-1]>
        <div :key="n - 1">
          <img :key="n - 1" src="./assets/logo.png" alt="Logo" />
          <div>{{ n }}</div>
        </div>
      </template>
    </VueCarousel>
  </div>
</template>

<script>
import VueCarousel from './components/VueCarousel.vue';

export default {
  name: 'App',
  components: {
    VueCarousel,
  },
};
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
