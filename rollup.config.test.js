/* @flow strict */

import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'test/test.js',
  output: [
    {
      file: 'build/test.js',
      format: 'umd',
      globals: {
        '@github/combobox-nav': 'Combobox'
      },
      name: 'TextExpanderElement',
      exports: 'named'
    }
  ],
  external: '@github/combobox-nav',
  plugins: [
    resolve(),
    babel({
      presets: ['github']
    })
  ]
}
