import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'test/test.js',
  output: [
    {
      file: 'build/test.js',
      format: 'umd',
      name: 'TextExpanderElement',
      exports: 'named'
    }
  ],
  external: '@github/combobox-nav',
  plugins: [
    resolve()
  ]
}
