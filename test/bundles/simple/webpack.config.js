/* eslint-env node */

const Statoscope = require('../../../packages/webpack-plugin').default;

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
    context: __dirname,
  },
  plugins: [
    new Statoscope({
      saveStatsTo:
        process.env.MODE === 'production' ? 'stats-prod.json' : 'stats-dev.json',
      open: false,
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
