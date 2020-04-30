import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'test/test.js',
  output: [
    {
      file: 'build/test.js',
      format: 'es',
    }
  ],
  plugins: [
    resolve()
  ]
}
