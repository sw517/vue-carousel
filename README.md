# vue-carousel

### Installation

1 . Install the npm package
```bash
npm install @samwood/vue-carousel
```

2  . Import VueCarousel into Vue component script
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

3 . Add VueCarousel to Vue component template
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
      <td><pre>autoplay</pre></td>
      <td>Boolean</td>
      <td><pre style="font-size: 0.8rem; min-width: 250px">false</pre></td>
      </td>
      <td>Detirmines if the carousel will slide automatically based on `autoplayInterval`.</td>
    </tr>
    <!-- autoplayHoverPause -->
    <tr>
      <td><pre>autoplayHoverPause</pre></td>
      <td>Boolean</td>
      <td><pre style="font-size: 0.8rem; min-width: 250px">false</pre></td>
      </td>
      <td>Detirmines if the carousel should stop auto sliding when the mouse hovers the carousel.</td>
    </tr>
    <!-- autoplayInterval -->
    <tr>
      <td><pre>autoplayInterval</pre></td>
      <td>Number</td>
      <td><pre style="font-size: 0.8rem; min-width: 250px">3000</pre></td>
      </td>
      <td>Changes the timing for auto slide in milliseconds.</td>
    </tr>
    <!-- breakpoints -->
    <tr>
      <td><pre>breakpoints</pre></td>
      <td>Object</td>
      <td>
<pre style="font-size: 0.8rem; min-width: 250px">
{
  xs: 0,
  sm: 600,
  md: 980,
  lg: 1200,
  xl: 1600
}
</pre>
      </td>
      </td>
      <td>Customise the breakpoints. All breakpoints must be defined and values must be valid or default will be used.</td>
    </tr>
    <!-- controls -->
    <tr>
      <td><pre>controls</pre></td>
      <td>Object</td>
      <td>
<pre style="font-size: 0.8rem; min-width: 250px">
{
  previous: "&amp;lt;",
  next: "&amp;gt;",
  styles: null
}
</pre>
      </td>
      <td>
        Change the contents and styles of the previous/next controls for the carousel. HTML can be passed in a String.<br/> Styles must be passed as an object.
        Example:
<pre style="font-size: 0.8rem; min-width: 250px">
{
  previous: "&lt;i class=\"fa fa-arrow-left\" /&gt;",
  next: "&lt;i class=\"fa fa-arrow-right\" /&gt;",
  styles: {
    background-color: '#000',
    color: 'white',
    border-radius: '10px'
  }
}
</pre>
      </td>
    </tr>
    <!-- loop -->
    <tr>
      <td><pre>loop</pre></td>
      <td>Boolean</td>
      <td><pre style="font-size: 0.8rem; min-width: 250px">false</pre></td>
      <td>Determines if the carousel should loop infintely. If false, carousel will only animate between first and last slide.</td>
    </tr>
    <!-- slidePadding -->
    <tr>
      <td><pre>slidePadding</pre></td>
      <td>Object</td>
      <td>
<pre style="font-size: 0.8rem; min-width: 250px">
{
  xs: null,
  sm: null,
  md: null,
  lg: null,
  xl: null
}
</pre>
      </td>
      <td>
        Change the padding between slides for specific breakpoints. Ensure a unit of measurement is included in the value.<br/>
<pre style="font-size: 0.8rem; min-width: 250px">
"20px" ✓
"20em" ✓
"20" X
</pre>
        If all breakpoints are null (default), a fallback CSS padding value is used.
      </td>
    </tr>
    <!-- slidesVisible -->
    <tr>
      <td><pre>slidesVisible</pre></td>
      <td>Object</td>
      <td>
<pre style="font-size: 0.8rem; min-width: 250px">
{
  xs: 1,
  sm: null,
  md: null,
  lg: null,
  xl: null
}
</pre>
      </td>
      <td>Change the number of slides visible at specific breakpoints. The number can be a whole number or decimal. If a breakpoint is null, the carousel will use the value from a previous breakpoint.</td>
    </tr>
    <!-- staticBreakpoint -->
    <tr>
      <td><pre>staticBreakpoint</pre></td>
      <td>String</td>
      <td><pre style="font-size: 0.8rem; min-width: 250px">null</pre></td>
      <td>
        Removes the carousel functionality and animation at the specified breakpoint and shows all items on screen.</br>
        Optional Values:
        <pre style="font-size: 0.8rem; min-width: 250px">null | "xs" | "sm" | "md" | "lg" | "xl"</pre></td></pre>
      </td>
    </tr>
  </tbody>
</table>


### Troubleshooting

#### The first slide is missing content
The carousel uses base-0 incrementing numbers for slot names.

`v-for="n in 10"` will produce numbers 1-10 for `n`. You will need to use `v-slot:[n-1]` to include the first slides content.
