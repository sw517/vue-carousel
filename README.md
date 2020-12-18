# vue-carousel

### Installation

1. Install the npm package
    ```bash
    npm install @samwood/vue-carousel
    ```

2. Import VueCarousel into Vue component script
    ```vue
    // my-component.vue

    <template>
      <MyComponent>...</MyComponent>
    </template>

    <script>
    import VueCarousel from '@samwood/vue-carousel';

    export default {
      name: 'MyComponent',
      components: {
        VueCarousel
      }
    }
    </script>
    ```

3. Add VueCarousel to Vue component template

    To populate the slides, you will need to add `<template>` for each slide with a `v-slot[0]` starting at base 0. Each `v-slot` should increment by 1 for every slide.
    ```vue
    // my-component.vue

    <template>
      <MyComponent>
        <VueCarousel>
          <template v-slot[0]>
            <MyChildComponent />
          </template>
          <template v-slot[1]>
            <MyChildComponent />
          </template>
          <template v-slot[3]>
            <MyChildComponent />
          </template>
        </VueCarousel>
      </MyComponent>
    </template>

    <script>
    ...
    </script>
    ```

    Optionally, you can dynamically change the v-slot to avoid repeated code.
    ```vue
    // my-component.vue

    <template>
      <MyComponent>
        <VueCarousel>
          <template v-for="n in slides" v-slot[n-1]>
            <MyChildComponent :key="`slide-${n-1}`" />
          </template>
        </VueCarousel>
      </MyComponent>
    </template>

    <script>
    ...
    </script>
    ```

### Config

#### Example
Vue carousel takes a `config` prop - an object contain various keys to change the functionality and appearance of the component.

```vue
<vue-carousel
  :config="{
    slidesVisible: {...},
    staticBreakpoint: "md",
    loop: true
  }"
>
...
</vue-carousel>
```

#### Parameters
<table>
  <thead>
    <th>Key</th>
    <th>Type</th>
    <th>Default Value</th>
    <th>Description</th>
  </thead>
  <tbody>
    <!-- autoplay -->
    <tr>
      <td>autoplay</td>
      <td>Boolean</td>
      <td><pre><code class="language-javascript">false</code></pre></td>
      </td>
      <td>Determines if the carousel will slide automatically based on `autoplayInterval`.</td>
    </tr>
    <!-- autoplayHoverPause -->
    <tr>
      <td>autoplayHoverPause</td>
      <td>Boolean</td>
      <td><pre><code class="language-javascript">false</code></pre></td>
      </td>
      <td>Determines if the carousel should stop auto sliding when the mouse hovers the carousel.</td>
    </tr>
    <!-- autoplayInterval -->
    <tr>
      <td>autoplayInterval</td>
      <td>Number</td>
      <td><pre><code class="language-javascript">3000</code></pre></td>
      </td>
      <td>Changes the timing for auto slide in milliseconds.</td>
    </tr>
    <!-- breakpoints -->
    <tr>
      <td>breakpoints</td>
      <td>Object</td>
      <td>
<pre><code class="language-javascript">
{
  xs: 0,
  sm: 600,
  md: 980,
  lg: 1200,
  xl: 1600
}
</code></pre>
      </td>
      </td>
      <td>Customise the breakpoints. All breakpoints must be defined and values must be valid or default will be used.</td>
    </tr>
    <!-- center -->
    <tr>
      <td>center</td>
      <td>Boolean</td>
      <td><pre><code class="language-javascript">false</code></pre></td>
      <td>Aligns the current slide in the center of the carousel instead of to the left-side.</td>
    </tr>
    <!-- controls -->
    <tr>
      <td>controls</td>
      <td>Object</td>
      <td>
<pre><code class="language-javascript">
{
  previous: "&amp;lt;",
  next: "&amp;gt;",
  play: 'Play',
  pause: 'Pause',
  buttonStyles: null,
  paginationNumbered: false,
  paginationStyles: null,
  showButtons: true,
  showPagination: false,
  showPlay: false,
}
</code></pre>
      </td>
      <td>
        Change the contents and styles of the previous/next controls and pagination for the carousel. HTML can be passed in a String to `previous` and `next`.<br/> Styles must be passed as an object.
        Example:
<pre><code class="language-javascript">
{
  previous: "&lt;i class=\"fa fa-arrow-left\" /&gt;",
  next: "&lt;i class=\"fa fa-arrow-right\" /&gt;",
  buttonStyles: {
    background-color: '#000',
    color: 'white',
    border-radius: '10px'
  }
}
</code></pre>
      </td>
    </tr>
    <!-- debug -->
    <tr>
      <td>debug</td>
      <td>Boolean</td>
      <td><pre><code class="language-javascript">false</code></pre></td>
      <td>Allows warnings and caught-errors in console if enabled.</td>
    </tr>
    <!-- loop -->
    <tr>
      <td>loop</td>
      <td>Boolean</td>
      <td><pre><code class="language-javascript">false</code></pre></td>
      <td>Determines if the carousel should loop infintely. If false, carousel will only animate between first and last slide.</td>
    </tr>
    <!-- mouseDrag -->
    <tr>
      <td>mouseDrag</td>
      <td>Boolean</td>
      <td><pre><code class="language-javascript">false</code></pre></td>
      <td>Determines if the carousel slides can be dragged using the mouse when holding left click. Note - the slides can be dragged on touch devices still even when mouseDrag is set to false.</br>This option works better when slides are not populated with links.</td>
    </tr>
    <!-- showEmptySpace -->
    <tr>
      <td>showEmptySpace</td>
      <td>Boolean</td>
      <td><pre><code class="language-javascript">false</code></pre></td>
      <td>
        <p>Determines if the carousel can be swiped until only the last slide is visible on the left side of the screen.</p>
        <p>If false, the carousel will not be slideable once the last slide is visible on screen.</p>
        <p><strong>For pagination</strong> - If true, a pagination button will be used for each slide. If false, pagination buttons will only show for the first slide rendered up to the first slide visible where the last slide is on screen (paginationCount = totalSlides - visibleSlidesOnScreen + 1). This is to prevent sliding past the last slide.</p>
        <p>Note - this option has no effect if loop is true.</p>
      </td>
    </tr>
    <!-- slidePadding -->
    <tr>
      <td>slidePadding</td>
      <td>Object</td>
      <td>
<pre><code class="language-javascript">
{
  xs: null,
  sm: null,
  md: null,
  lg: null,
  xl: null
}
</code></pre>
      </td>
      <td>
        Change the padding between slides for specific breakpoints. If a unit of measurement is not included in the value, it will be assumed to be a pixel value.<br/>
        Example:
<pre><code class="language-javascript">
{
  xs: 10, // renders as 20px
  sm: "15px",
  md: "1rem" // lg and xl will inherit md value if left null
}
</code></pre>
        If all breakpoints are null (default), a fallback CSS padding value is used.
      </td>
    </tr>
    <!-- slidesVisible -->
    <tr>
      <td>slidesVisible</td>
      <td>Object</td>
      <td>
<pre><code class="language-javascript">
{
  xs: 1,
  sm: null,
  md: null,
  lg: null,
  xl: null
}
</code></pre>
      </td>
      <td>Change the number of slides visible at specific breakpoints. The number can be a whole number or decimal. If a breakpoint is null, the carousel will use the value from a previous breakpoint.</td>
    </tr>
    <!-- startingSlide -->
    <tr>
      <td>startingSlide</td>
      <td>Number</td>
      <td><pre><code class="language-javascript">0</code></pre></td>
      <td>The index of the slide to start on when the carousel renders. If the index is invalid, the default will be used.
      </td>
    </tr>
    <!-- staticBreakpoint -->
    <tr>
      <td>staticBreakpoint</td>
      <td>String</td>
      <td><pre><code class="language-javascript">null</code></pre></td>
      <td>
        Removes the carousel functionality and animation at the specified breakpoint and shows all items on screen.</br>
        Optional Values:
        <pre><code class="language-javascript">null | "xs" | "sm" | "md" | "lg" | "xl"</code></pre></td></code></pre>
      </td>
    </tr>
    <!-- touchDrag -->
    <tr>
      <td>touchDrag</td>
      <td>Boolean</td>
      <td><pre><code class="language-javascript">true</code></pre></td>
      <td>
        <p>Determines if the user can drag carousel slides with touch input such as on mobile and tablets or with touch screen monitors.
        </p>
        <p>This is set to true by default as touch drag is better UX on touch devices compared to button presses.</p>
      </td>
    </tr>
    <!-- transitionDuration -->
    <tr>
      <td>transitionDuration</td>
      <td>Number</td>
      <td><pre><code class="language-javascript">500</code></pre></td>
      <td>
        The CSS transition-duration property that controls how long it takes to animate between slides.
      </td>
    </tr>
    <!-- transitionTimingFunction -->
    <tr>
      <td>transitionTimingFunction</td>
      <td>String</td>
      <td><pre><code class="language-javascript">'ease'</code></pre></td>
      <td>
        The CSS transition-timing-function property that controls the animation timing function between slides.
      </td>
    </tr>
  </tbody>
</table>

### Event API
<table>
  <thead>
    <th>Event</th>
    <th>type</th>
    <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td>slide-change</td>
      <td>number</td>
      <td>Emits the new slide number on slide-change.</td>
    </tr>
  </tbody>
</table>

### Styling

Although the controls have options to pass styling through a JS object, this isn't always ideal, especially when you want to use your own CSS variables and mixins. You will find below a list of CSS classes that you can target to override existing styles.

#### Carousel classes

```
.v-carousel
```

If you set a breakpoint to become static, you may want to change the layout of the slides. You can do this by targetting the following class:

```
.v-carousel--static
```


#### Controls classes

```
.v-carousel__controls__btn

.v-carousel__controls__btn--prev
.v-carousel__controls__btn--next
.v-carousel__controls__btn--disabled

.v-carousel-pagination
.v-carousel-pagination__list // ul/ol element containing li elements
.v-carousel-pagination__li // li element wrapping the button
.v-carousel-pagination__btn
.v-carousel-pagination__btn--active
.v-carousel-pagination__btn--number
```


#### Slides

```
.v-carousel__slide
```

---

### Troubleshooting

Note: Ensure that you do not apply any attributes to slide slots within the carousel that should not be duplicated such as `id` as if you set `loop` to `true`, the content in these slides will be duplicated and will cause issues.

#### The first slide is missing content
The carousel uses base-0 incrementing numbers for slot names.

`v-for="n in 10"` will produce numbers 1-10 for `n`. You will need to use `v-slot:[n-1]` to include the first slides content.

#### My styling isn't being applied to the carousel elements
If you are using scoped styles, ensure that you are using `::v-deep` before targetting the carousel class.

Example
```scss
<style lang="scss scoped>
.my-component {
  & ::v-deep .v-carousel--static {
    display: grid;
  }
}
</style>
```

#### The carousel won't autoplay when off-screen

The carousel uses an [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to remove the autoplay-interval when the carousel is not visible on screen.

This has been done to improve efficiency of the browser so that the carousel is not carrying out performance-expensive animations that may interfer with the user's experience.

Autoplay will be enabled again when the carousel is visible again.
