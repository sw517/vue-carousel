import commonjs from '@rollup/plugin-commonjs' // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue' // Handle .vue SFC files
import buble from '@rollup/plugin-buble' // Transpile/polyfill with reasonable browser support
export default {
  input: 'src/wrapper.js', // Path relative to package.json
  output: {
    name: 'VueCarousel',
    exports: 'named',
    globals: {
      'lodash.merge': 'merge',
      'lodash.clonedeep': 'cloneDeep'
    }
  },
  external: ['lodash.merge', 'lodash.clonedeep'],
  plugins: [
    commonjs(),
    vue({
      css: true, // Dynamically inject css as a <style> tag
      compileTemplate: true // Explicitly convert template to render function
    }),
    buble({
      transforms: {
        asyncAwait: false
      }
    }) // Transpile to ES5
  ]
}
