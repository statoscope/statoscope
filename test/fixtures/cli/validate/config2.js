/* eslint-env node */

module.exports = {
  plugins: [['../../../../packages/stats-validator-plugin-webpack', 'webpack']],
  validate: {
    rules: {
      //'webpack/disallowed-deps': ['error', ['foo', { type: 'module', name: /\.\/src/ }]],
      'webpack/restricted-packages': ['error', ['lodash']],
      'webpack/no-packages-dups': ['error'],
      //'webpack/disallowed-deps': ['error', [/\.min\.js/]],
    },
  },
};
