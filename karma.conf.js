// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const fs = require('fs');

module.exports = function (config) {
  // Webpack NormalModuleReplacementPlugin shim for node: scheme in pptxgenjs
  if (config.buildWebpack && config.buildWebpack.webpackConfig) {
    const webpack = require('webpack');
    const path = require('path');
    const emptyShim = path.resolve(__dirname, 'src/shims/empty.ts');

    config.buildWebpack.webpackConfig.plugins = config.buildWebpack.webpackConfig.plugins || [];
    config.buildWebpack.webpackConfig.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = emptyShim;
      })
    );
  }

  // Auto-detect available browser (ChromeHeadless for CI/Actions, FirefoxHeadless fallback for local Linux)
  const hasChrome = Boolean(process.env.CHROME_BIN) ||
    fs.existsSync('/usr/bin/google-chrome') ||
    fs.existsSync('/usr/bin/chromium') ||
    fs.existsSync('/usr/bin/chromium-browser');
  const defaultHeadlessBrowser = hasChrome ? 'ChromeHeadlessCI' : 'FirefoxHeadless';

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-jasmine-html-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // configuration options for Jasmine can be set here
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [defaultHeadlessBrowser],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--headless=new'
        ]
      },
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless']
      }
    },
    singleRun: false,
    restartOnFileChange: true
  });
};

