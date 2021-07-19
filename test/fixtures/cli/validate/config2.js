/* eslint-env node */

module.exports = {
  plugins: [['../../../../packages/stats-validator-plugin-webpack', 'webpack']],
  validate: {
    rules: {
      //'webpack/disallowed-deps': ['error', ['foo', { type: 'module', name: /\.\/src/ }]],
      'webpack/disallowed-deps': ['error', ['lodash']],
      'webpack/no-package-dups': ['error'],
      //'webpack/disallowed-deps': ['error', [/\.min\.js/]],
    },
  },
};
