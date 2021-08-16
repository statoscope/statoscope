/* eslint-env node */

const path = require('path');

module.exports = {
  plugins: [['../../../packages/stats-validator-plugin-webpack', 'webpack']],
  validate: {
    reporters: [
      [
        '../../../packages/stats-validator-reporter-stats-report',
        { saveOnlyStats: true, saveStatsTo: path.join(__dirname, 'stats-prod.json') },
      ],
    ],
    rules: {
      'webpack/restricted-modules': ['error', [/\.\/src/]],
      'webpack/restricted-packages': ['error', ['foo']],
    },
  },
};
