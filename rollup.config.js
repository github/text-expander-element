const pkg = require('./package.json')
const resolve = require('rollup-plugin-node-resolve')

export default [
  {
    external: ['@github/combobox-nav'],
    input: 'dist/index.js',
    output: {
      file: pkg['module'],
      format: 'es'
    },
    plugins: [resolve()]
  },
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/bundle.js',
      format: 'es',
    },
    plugins: [resolve()]
  }
]
