/* global require, process, module */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = [
  {
    mode,
    entry: './src/index.js',
    output: {
      library: 'Statoscope',
      libraryTarget: 'umd',
      path: path.resolve('dist'),
    },
    module: {
      rules: [
        {
          test: /\.js?$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
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
    optimization: {
      usedExports: false,
    },
  },
  {
    mode,
    entry: './src/index.js',
    output: {
      library: 'Statoscope',
      libraryTarget: 'umd',
      path: path.resolve('dist'),
      filename: 'split/[name].js',
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'split/[name].css',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.js?$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
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
    optimization: {
      usedExports: false,
    },
  },
];
