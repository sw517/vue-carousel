<template>
  <button class="v-carousel-btn">
    <slot>
      <div v-html="$props.content" />
    </slot>
  </button>
</template>

<script>
export default {
  name: 'VueCarouselButton',
  props: {
    content: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss">
.v-carousel-btn {
  appearance: none;
  -webkit-appearance: none;
  border-radius: 10px;
  border: 0;
  background-color: #5fc59d;
  box-shadow: 0 2px 2px 0px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  padding: 4px 12px;
  color: #35495e;
  transition: border-radius ease 0.2s;
  will-change: border-radius;

  @media (pointer: fine) {
    &:hover {
      border-radius: 4px;
    }
  }
}
</style>
