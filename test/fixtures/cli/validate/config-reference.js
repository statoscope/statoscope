/* eslint-env node */

module.exports = {
  plugins: [['../../../../packages/stats-validator-plugin-webpack', 'webpack']],
  validate: {
    rules: {
      'webpack/restricted-modules': ['error', [/\.\/src/]],
      'webpack/restricted-packages': ['error', ['foo']],
      'webpack/diff-deprecated-modules': ['error', [/.+/]],
      'webpack/diff-deprecated-packages': ['error', [/.+/]],
    },
  },
};
