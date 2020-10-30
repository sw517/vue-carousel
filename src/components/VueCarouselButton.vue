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

<style lang="scss" scoped>
.v-carousel-btn {
  appearance: none;
  -webkit-appearance: none;
  border: 0;
  border-radius: 6px;
  background-color: rgba(250, 250, 250, 0.7);
  box-shadow: 0 2px 2px 0px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  padding: 4px 8px;
  transition: background-color ease 0.2s;
  will-change: background-color;

  &:hover {
    background-color: #fff;
  }
}
</style>
