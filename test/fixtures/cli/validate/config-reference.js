/* eslint-env node */

module.exports = {
  validate: {
    plugins: [['../../../../packages/stats-validator-plugin-webpack', 'webpack']],
    rules: {
      'webpack/restricted-modules': ['error', [/\/src\//]],
      'webpack/restricted-packages': ['error', ['foo']],
      'webpack/diff-deprecated-modules': ['error', [/.+/]],
      'webpack/diff-deprecated-packages': ['error', [/.+/]],
    },
  },
};
