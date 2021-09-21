/* eslint-env node */

const path = require('path');

module.exports = {
  validate: {
    plugins: [['../../../../packages/stats-validator-plugin-webpack', 'webpack']],
    reporters: [
      [
        '../../../../packages/stats-validator-reporter-stats-report',
        { saveOnlyStats: true, saveStatsTo: path.join(__dirname, 'stats-dev.json') },
      ],
    ],
    rules: {
      'webpack/restricted-modules': ['error', [/\/src\//]],
      'webpack/restricted-packages': ['error', ['foo']],
    },
  },
};
