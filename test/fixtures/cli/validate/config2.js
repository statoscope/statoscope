/* eslint-env node */

module.exports = {
  validate: {
    plugins: [['../../../../packages/stats-validator-plugin-webpack', 'webpack']],
    reporters: [
      '../../../../packages/stats-validator-reporter-console',
      ['../../../../packages/stats-validator-reporter-stats-report', { open: true }],
    ],
    rules: {
      'webpack/build-time-limits': ['error', { global: 1 }],
      'webpack/restricted-modules': ['error', [/css-tree/]],
      'webpack/restricted-packages': ['error', ['lodash']],
      'webpack/no-packages-dups': ['error'],
      'webpack/entry-download-time-limits': ['error', { global: { maxDownloadTime: 1 } }],
      'webpack/entry-download-size-limits': ['error', { global: { maxSize: 1 } }],
      'webpack/no-modules-deopts': ['warn'],
      'webpack/diff-build-time-limits': ['error', { global: -Infinity }],
      'webpack/diff-entry-download-size-limits': [
        'error',
        { global: { maxSizeDiff: 1 } },
      ],
      'webpack/diff-entry-download-time-limits': [
        'error',
        { global: { maxDownloadTimeDiff: 1 } },
      ],
      'webpack/diff-deprecated-modules': ['error', [/css-tree/]],
      'webpack/diff-deprecated-packages': ['error', [/lodash/]],
    },
  },
};
