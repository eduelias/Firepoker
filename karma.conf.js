// Karma configuration
// Generated on Tue Sep 05 2017 09:53:02 GMT-0300 (E. South America Standard Time)
'use strict'

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'app/components/angular/angular.js',
            'app/components/angular-route/angular-route.js',
            'app/components/angular-mocks/angular-mocks.js',
            'app/components/angular-cookies/angular-cookies.js',
            'app/components/angular-toArrayFilter/toArrayFilter.js',
            'app/scripts/*.js',
            'app/scripts/**/*.js',
            // 'test/mock/**/*.js',
            'test/spec/**/*.js',
            'https://www.gstatic.com/firebasejs/3.6.6/firebase.js',
            'https://cdn.firebase.com/libs/angularfire/2.3.0/angularfire.min.js'
        ],

        // debug with vs
        customLaunchers: {
            ChromeDebugging: {
                base: 'Chrome',
                flags: ['--remote-debugging-port=9333']
            }
        },

        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port
        port: 9000,

        // cli runner port
        runnerPort: 9000,

        // web server port
        //port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        get browsers() {
            if (process.env.TRAVIS) {
                return ['Firefox'];
            } else {
                return ['ChromeDebugging'];
            }
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        captureTimeout: 30000,
        browserDisconnectTimeout: 1000,
        browserDisconnectTolerance: 1,
        browserNoActivityTimeout: 6000,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
}