/* eslint-env node */

const path = require('path');
const Statoscope = require('../../../../packages/webpack-plugin').default;

const context = path.resolve(__dirname, '..');

module.exports = {
  entry: {
    one: './src/index.ts',
    two: './src/index2.ts',
  },
  externals: {
    extLib: 'extLib',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.wasm'],
  },
  stats: {
    context,
  },
  plugins: [
    new Statoscope({
      saveStatsTo:
        process.env.MODE === 'production' ? 'stats-prod.json' : 'stats-dev.json',
      open: false,
      statsOptions: {
        context,
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /statoscope\.png/,
        type: 'asset/inline',
      },
      {
        test: /\.css$/,
        use: 'css-loader',
      },
      {
        test: /\.ts$/,
        use: 'babel-loader',
      },
    ],
  },
};
