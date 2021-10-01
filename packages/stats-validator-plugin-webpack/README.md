# stats-validator-plugin-webpack

[![npm version](https://badge.fury.io/js/%40statoscope%2Fstats-validator-plugin-webpack.svg)](https://badge.fury.io/js/%40statoscope%2Fstats-validator-plugin-webpack)
[![Support](https://img.shields.io/badge/-Support-blue)](https://opencollective.com/statoscope)

Webpack stats validator plugin for @statoscope/stats-validator

This package contains rules to validate a webpack bundle.

## Usage

1. Install

   `npm i -D @statoscope/stats-validator-plugin-webpack`
2. Add into `statoscope.config.js`
    ```js
    module.exports = {
      validate: {
        // add webpack plugin with rules
        plugins: ['@statoscope/webpack'],
        // rules to validate your stats (use all of them or only specific rules)
        rules: {      
          // ensures that the build time has not exceeded the limit (10 sec)
          '@statoscope/webpack/build-time-limits': ['error', 10000],
          // ensures that bundle doesn't use specified modules
          '@statoscope/webpack/restricted-modules': ['error', [/some-module\.js/,]],
          // ensures that bundle doesn't use specified packages
          '@statoscope/webpack/restricted-packages': ['error', ['lodash', 'browserify-crypto']],
          // ensures that bundle hasn't package duplicates
          '@statoscope/webpack/no-packages-dups': ['error'],
          // ensure that the download time of entrypoints is not over the limit (3 sec)
          '@statoscope/webpack/entry-download-time-limits': ['error', { global: { maxDownloadTime: 3000 } }],
          // ensure that the download size of entrypoints is not over the limit (3 mb)
          '@statoscope/webpack/entry-download-size-limits': ['error', { global: { maxSize: 3 * 1024 * 1024 } }],
          // ensures that bundle doesn't have modules with deoptimization
          '@statoscope/webpack/no-modules-deopts': ['warn'],
          // compares build time between input and reference stats. Fails if build time diff is the limit (3 sec)
          '@statoscope/webpack/diff-build-time-limits': ['error', 3000],
          // diff download size of entrypoints between input and reference stats. Fails if size diff is over the limit (3 kb)
          '@statoscope/webpack/diff-entry-download-size-limits': [
            'error',
            { global: { maxSizeDiff: 3 * 1024 } },
          ],
          // diff download time of entrypoints between input and reference stats. Fails if download time is over the limit (500 ms)
          '@statoscope/webpack/diff-entry-download-time-limits': [
            'error',
            { global: { maxDownloadTimeDiff: 500 } },
          ],
          // compares usage of specified modules between input and reference stats
          '@statoscope/webpack/diff-deprecated-modules': ['error', [/\/path\/to\/module\.js/]],
          // compares usage of specified packages usage between input and reference stats. Fails if rxjs usage has increased
          '@statoscope/webpack/diff-deprecated-packages': ['error', ['rxjs']],
        }
      }
    }   
    ```

## Rules

- [build-time-limits](docs/rules/build-time-limits.md) - Ensures that the build time has not exceeded the limit 
- [diff-build-time-limits](docs/rules/diff-build-time-limits.md) - Compares build time between input and reference stats. Fails if build time has increased
- [diff-deprecated-modules](docs/rules/diff-deprecated-modules.md) - Compares usage of specified modules between input and reference stats
- [diff-deprecated-packages](docs/rules/diff-deprecated-packages.md) - Compares usage of specified packages usage between input and reference stats
- [diff-entry-download-size-limits](docs/rules/diff-entry-download-size-limits.md) - Diff download size of entrypoints between input and reference stats
- [diff-entry-download-time-limits](docs/rules/diff-entry-download-time-limits.md) - Diff download time of entrypoints between input and reference stats
- [entry-download-size-limits](docs/rules/entry-download-size-limits.md) - Ensure that the download size of entrypoints is not over the limit
- [entry-download-time-limits](docs/rules/entry-download-time-limits.md) - Ensure that the download time of entrypoints is not over the limit
- [no-modules-deopts](docs/rules/no-modules-deopts.md) - Ensures that bundle doesn't have modules with deoptimization
- [no-packages-dups](docs/rules/no-packages-dups.md) - Ensures that bundle hasn't package duplicates
- [restricted-modules](docs/rules/restricted-modules.md) - Ensures that bundle doesn't use specified modules
- [restricted-packages](docs/rules/restricted-packages.md) - Ensures that bundle doesn't use specified packages
