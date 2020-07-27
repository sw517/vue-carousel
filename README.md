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
