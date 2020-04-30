module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      {pattern: '../dist/bundle.js', type: 'module'},
      {pattern: '../build/test.js', type: 'module'}
    ],
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity,
    middleware: [],
    plugins: ['karma-*']
  })
}
