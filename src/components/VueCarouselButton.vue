<template>
  <button type="button" class="v-carousel-btn">
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
  border: 0;
  background-color: #5fc59d;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.4);
  cursor: pointer;
  padding: 4px 12px;
  color: #fff;
  transition: box-shadow ease 0.2s;
  will-change: box-shadow;

  @media (pointer: fine) {
    &:hover {
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.6);
    }
  }
}
</style>
