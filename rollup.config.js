const pkg = require('./package.json')
const resolve = require('rollup-plugin-node-resolve')

export default {
  input: 'dist/index.js',
  output: [
    {
      file: pkg['module'],
      format: 'es'
    },
    {
      file: pkg['main'],
      format: 'umd',
      name: 'TextExpanderElement',
      exports: 'named'
    }
  ],
  plugins: [resolve()]
}
