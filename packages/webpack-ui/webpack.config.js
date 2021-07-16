/* eslint-env node */

const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
let Statoscope;
try {
  Statoscope = require('../webpack-plugin').default;
} catch (e) {
  Statoscope = class {
    apply() {}
  };
}

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

function makeConfig(config) {
  return merge(
    {
      mode,
      entry: './src/',
      output: {
        library: 'Statoscope',
        libraryTarget: 'umd',
        path: path.resolve('dist'),
      },
      resolve: {
        extensions: ['.ts', '.js', '.json', '.wasm'],
        fallback: {
          path: require.resolve('path-browserify'),
        },
        alias: {
          [require.resolve(
            '@statoscope/stats-extension-compressed/dist/generator'
          )]: false,
        },
      },
      cache: { type: 'filesystem' },
      module: {
        rules: [
          {
            test: /\.[tj]s$/,
            exclude: /node_modules/,
            use: 'babel-loader',
          },
          {
            test: /node_modules\/@carrotsearch\/foamtree\/foamtree\.js$/,
            use: ['./patch-foam'],
          },
        ],
      },
      plugins: [
        new Statoscope({
          saveTo: `analyze/statoscope-[name]-[hash].html`,
          saveStatsTo: `analyze/stats-[name]-[hash].json`,
          open: 'file',
        }),
        new webpack.EnvironmentPlugin({
          STATOSCOPE_VERSION: require('./package.json').version,
        }),
      ],
    },
    config
  );
}

module.exports = makeConfig({
  module: {
    rules: [
      {
        test: /\.css$/,
        include: /node_modules\/@discoveryjs/,
        use: [
          {
            loader: 'style-loader',
            options: {
              attributes: {
                'statoscope-style': true,
              },
            },
          },
          'css-loader',
        ],
      },
      {
        test: /\.css$/,
        include: path.resolve('src'),
        use: [
          {
            loader: 'style-loader',
            options: {
              attributes: {
                'statoscope-style': true,
              },
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
    ],
  },
});
