process.env.CHROME_BIN = require('chromium').path

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      { pattern: '../node_modules/trix/dist/trix.js', type: 'js' },
      { pattern: '../dist/bundle.js', type: 'module' },
      { pattern: '../build/test.js', type: 'module' }
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
