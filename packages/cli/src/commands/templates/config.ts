export function configTemplate(): string {
  return `module.exports = {
  validate: {
    // add webpack plugin with rules
    plugins: ['@statoscope/webpack',
    // 'statoscope-stats-validator-plugin-foo', // full package name
    // '@statoscope/webpack', // short package name, resolves to @statoscope/stats-validator-plugin-webpack
    // 'webpack', // short package name, resolves to @statoscope/stats-validator-plugin-webpack or statoscope-stats-validator-plugin-webpack
    // ['./my/plugin.js', 'my-plugin'], // relative path (relative config path)
    // [require.resolve('./my/another/plugin.js'), 'my-another-plugin'] // absolute path
    ],
    reporters: [
      // console-reporter to output results into console (enabled by default)
      '@statoscope/console',
      // reporter that generates UI-report with validation-results
      ['@statoscope/stats-report', { open: true }],
    ],
    // rules to validate your stats (use all of them or only specific rules)
    rules: {
      // ensures that the build time has not exceeded the limit (10 sec)
      '@statoscope/webpack/build-time-limits': ['error', 10000],
      // ensures that bundle doesn't use specified packages
      '@statoscope/webpack/restricted-packages': [
        'error',
        ['lodash', 'browserify-crypto'],
      ],
      // ensures that bundle hasn't package duplicates
      '@statoscope/webpack/no-packages-dups': ['error'],
      // ensure that the download time of entrypoints is not over the limit (3 sec)
      '@statoscope/webpack/entry-download-time-limits': [
        'error',
        { global: { maxDownloadTime: 3000 } },
      ],
      // ensure that the download size of entrypoints is not over the limit (3 mb)
      '@statoscope/webpack/entry-download-size-limits': [
        'error',
        { global: { maxSize: 3 * 1024 * 1024 } },
      ],
      // diff download size of entrypoints between input and reference stats. Fails if size diff is over the limit (3 kb)
      '@statoscope/webpack/diff-entry-download-size-limits': [
        'error',
        { global: { maxSizeDiff: 3 * 1024 } },
      ],
      // compares usage of specified packages usage between input and reference stats. Fails if rxjs usage has increased
      '@statoscope/webpack/diff-deprecated-packages': ['error', ['rxjs']],
      // 'my-plugin/some-rule': ['error'],
    },
  },
};
`;
}
