# vue-carousel

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Troubleshooting

#### The first slide is missing content
The carousel uses base-0 incrementing numbers for slot names.

`v-for="n in 10"` will produce numbers 1-10 for `n`. You will need to use `v-slot:[n-1]` to include the first slides content.

### Config

Vue carousel takes a `config` prop - an object contain various keys to change the functionality and appearance of the component.

```
<vue-carousel
  :config="{
    slidesVisible: {...},
    staticBreakpoint: 'md',
    loop: true
  }"
>
...
</vue-carousel>
```
<!--
| Key             | Type    | Default&nbsp;Value&nbsp;&nbsp;&nbsp; | Optional&nbsp;Values&nbsp;&nbsp;&nbsp; | Description                         |
| :-------------- | :------ | :------------ | :-------------- | :---------------------------------- |
| `controls`      | Object  | `{`<br/>&nbsp;&nbsp;`previous: "&lt;",`<br/>&nbsp;&nbsp;`next: "&gt;"`<br>`}` | `{`<br/>&nbsp;&nbsp;`previous: [String]`<br/>&nbsp;&nbsp;`next: [String]`<br/>`}` | Change the contents of the previous/next controls for the carousel. HTML can be passed in a String. |
| `loop`          | Boolean | `true`  | | Determines if the carousel should loop infintely. If false, carousel will only animate between first and last slide |
| `slidePadding`  | Object  | `{`<br/>&nbsp;&nbsp;`xs: null,`<br/>&nbsp;&nbsp;`sm: null,`<br/>&nbsp;&nbsp;`md: null,`<br/>&nbsp;&nbsp;`lg: null`<br/>&nbsp;&nbsp;`xl: null`<br/>`}` | `{`<br/>&nbsp;&nbsp;`[Breakpoint]: "[Number][unit]",`<br/>&nbsp;&nbsp;`...`<br/>`}` | Change the padding between slides for specific breakpoints. Ensure a unit of measurement is included in the value.<br/>`"20px"` ✓<br/>`"20em"` ✓<br/>`"20"` X |
| `slidesVisible` | Object  | `{`<br/>&nbsp;&nbsp;`xs: 1,`<br/>&nbsp;&nbsp;`sm: null,`<br/>&nbsp;&nbsp;`md: null,`<br/>&nbsp;&nbsp;`lg: null`<br/>&nbsp;&nbsp;`xl: null`<br/>`}` | `{`<br>&nbsp;&nbsp;`[Breakpoint]: [Number],`<br>&nbsp;&nbsp;`...`<br>`}` | Change the number of slides visible at specific breakpoints. The number can be a whole number of decimal. If a breakpoint is null, the carousel will use the value from a previous breakpoint. |
| `staticBreakpoint` | String | `null`       | `null`<br/>`"xs"`<br/>`"sm"`<br/>`"md"`<br/>`"lg"`<br/>`"xl"`  | Determines at which breakpoint the carousel becomes static and shows all content | -->

### Table Key

`Breakpoint`
A String value - can be "xs", "sm", "md", "lg" or "xl".

`Unit`
Any valid CSS unit of measurement i.e "px" or "em".

`Number`
Any positive integer or decimal number.

`CSS-Property`
Any valid CSS property

`CSS-Value`
Any valid CSS value

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
