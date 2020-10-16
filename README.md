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

| Key             | Type    | Default&nbsp;Value&nbsp;&nbsp;&nbsp; | Optional&nbsp;Values&nbsp;&nbsp;&nbsp; | Description                         |
| :-------------- | :------ | :------------ | :-------------- | :---------------------------------- |
| `controls`      | Object  | `{`<br/>&nbsp;&nbsp;`previous: "&lt;",`<br/>&nbsp;&nbsp;`next: "&gt;"`<br>`}` | `{`<br/>&nbsp;&nbsp;`previous: [String]`<br/>&nbsp;&nbsp;`next: [String]`<br/>`}` | Change the contents of the previous/next controls for the carousel. HTML can be passed in a String. |
| `loop`          | Boolean | `true`  | | Determines if the carousel should loop infintely. If false, carousel will only animate between first and last slide |
| `slidePadding`  | Object  | `{`<br/>&nbsp;&nbsp;`xs: null,`<br/>&nbsp;&nbsp;`sm: null,`<br/>&nbsp;&nbsp;`md: null,`<br/>&nbsp;&nbsp;`lg: null`<br/>&nbsp;&nbsp;`xl: null`<br/>`}` | `{`<br/>&nbsp;&nbsp;`[Breakpoint]: "[Number][unit]",`<br/>&nbsp;&nbsp;`...`<br/>`}` | Change the padding between slides for specific breakpoints. Ensure a unit of measurement is included in the value.<br/>`"20px"` ✓<br/>`"20em"` ✓<br/>`"20"` X |
| `slidesVisible` | Object  | `{`<br/>&nbsp;&nbsp;`xs: 1,`<br/>&nbsp;&nbsp;`sm: null,`<br/>&nbsp;&nbsp;`md: null,`<br/>&nbsp;&nbsp;`lg: null`<br/>&nbsp;&nbsp;`xl: null`<br/>`}` | `{`<br>&nbsp;&nbsp;`[Breakpoint]: [Number],`<br>&nbsp;&nbsp;`...`<br>`}` | Change the number of slides visible at specific breakpoints. The number can be a whole number of decimal. If a breakpoint is null, the carousel will use the value from a previous breakpoint. |
| `staticBreakpoint` | String | `null`       | `null`<br/>`"xs"`<br/>`"sm"`<br/>`"md"`<br/>`"lg"`<br/>`"xl"`  | Determines at which breakpoint the carousel becomes static and shows all content |
