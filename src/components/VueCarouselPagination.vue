<template>
  <nav role="navigation" class="v-carousel-pagination">
    <component :is="listType" class="v-carousel-pagination__list">
      <li
        v-for="(n, index) in Number($props.count)"
        :key="index"
        class="v-carousel-pagination__li"
      >
        <button
          type="button"
          @click="handlePaginationClick(index)"
          @keydown.space.prevent="handlePaginationClick(index)"
          @keydown.enter="handlePaginationClick(index)"
          :style="$props.buttonStyles"
          :aria-label="`Go to Page ${n}`"
          :aria-current="Number($props.current) === index"
          :title="`Go to Page ${n}`"
          :class="{
            'v-carousel-pagination__btn--active':
              Number($props.current) === index,
            'v-carousel-pagination__btn--number': $props.numbered
          }"
          class="v-carousel-pagination__btn"
        >
          <span
            v-if="$props.numbered"
            class="v-carousel-pagination__btn__text"
            >{{ n }}</span
          >
        </button>
      </li>
    </component>
  </nav>
</template>

<script>
export default {
  name: 'VueCarouselPagination',
  props: {
    count: {
      type: [String, Number],
      default: 0
    },
    current: {
      type: [String, Number],
      default: 0
    },
    buttonStyles: {
      type: Object,
      default() {
        return {}
      }
    },
    numbered: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    listType() {
      return this.$props.numbered ? 'ol' : 'ul'
    }
  },
  methods: {
    handlePaginationClick(index) {
      this.$emit('pagination-click', index)
    }
  }
}
</script>

<style lang="scss">
.v-carousel-pagination {
  margin-top: 15px;

  &__list {
    list-style: none;
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }

  &__li {
    margin-bottom: 10px;
  }

  &__btn {
    display: block;
    appearance: none;
    min-width: 12px;
    max-width: 12px;
    height: 12px;
    background-color: #fff;
    border: 1px solid #35495e;
    border-radius: 999px;
    padding: 0;
    margin-left: 5px;
    margin-right: 5px;
    cursor: pointer;

    &--number {
      max-width: none;
      height: auto;
      padding: 3px 6px;
      font-size: 12px;
      border-radius: 6px;

      &.v-carousel-pagination__btn--active {
        color: #fff;
      }
    }

    &--active {
      background-color: #49b883;
    }
  }
}
</style>
