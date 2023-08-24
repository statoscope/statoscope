/* eslint-env node */

const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
let Statoscope;
try {
  Statoscope = require('../webpack-plugin').default;
} catch (e) {
  Statoscope = class {
    apply() {}
  };
}

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const isDev = mode === 'development' && process.env.STATOSCOPE_DEV;

function makeConfig(config) {
  return merge(
    {
      mode,
      devtool: isDev ? 'eval-source-map' : false,
      entry: './src/',
      output: {
        library: 'Statoscope',
        libraryTarget: 'umd',
        path: path.resolve('dist'),
        publicPath: '',
      },
      devServer: {
        devMiddleware: {
          writeToDisk: true,
        },
        client: {
          overlay: false,
        },
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
          {
            test: /\.(png|svg)$/,
            type: 'asset/inline',
          },
        ],
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.STATOSCOPE_DEV': JSON.stringify(process.env.STATOSCOPE_DEV),
        }),
        ...(isDev
          ? [
              new HtmlWebpackPlugin({
                template: 'dev.html',
                scriptLoading: 'blocking',
                inject: 'head',
              }),
              new Statoscope({
                // saveTo: `analyze/statoscope-[name]-[hash].html`,
                saveStatsTo: `analyze/stats.json`,
                open: 'file',
              }),
            ]
          : []),
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
