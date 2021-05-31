/* global require, process, module */
const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const StatoscopeWebpackPlugin = require('../webpack-plugin');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

function makeConfig(config) {
  return merge(
    {
      mode,
      entry: './src/index.js',
      output: {
        library: 'Statoscope',
        libraryTarget: 'umd',
        path: path.resolve('dist'),
      },
      resolve: {
        fallback: {
          path: require.resolve('path-browserify'),
        },
      },
      module: {
        rules: [
          {
            test: /\.js$/,
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
        new webpack.EnvironmentPlugin({
          STATOSCOPE_VERSION: require('./package.json').version,
        }),
      ],
    },
    config
  );
}

module.exports = makeConfig({
  plugins: process.env.DEBUG ? [new StatoscopeWebpackPlugin({ open: 'file' })] : [],
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
