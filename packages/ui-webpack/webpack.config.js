/* global require, process, module */
const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StatoscopeWebpackPlugin = require('./');

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

module.exports = [
  makeConfig({
    name: 'mono',
    module: {
      rules: [
        {
          test: /\.css$/,
          include: /node_modules\/@discoveryjs/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.css$/,
          include: path.resolve('src'),
          use: [
            'style-loader',
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
  }),
  makeConfig({
    name: 'split',
    output: {
      filename: 'split/[name].js',
    },
    plugins: [
      new StatoscopeWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: 'split/[name].css',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          include: /node_modules\/@discoveryjs/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.css$/,
          include: path.resolve('src'),
          use: [
            MiniCssExtractPlugin.loader,
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
  }),
];
