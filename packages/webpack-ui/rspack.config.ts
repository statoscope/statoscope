/* eslint-env node */

import path from 'path';

import { merge } from 'webpack-merge';
import webpack, { type Configuration } from '@rspack/core';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// @ts-ignore
let Statoscope: typeof import('../webpack-plugin').default;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Statoscope = require('../webpack-plugin').default;
} catch (e) {
  // @ts-ignore
  Statoscope = class {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    apply() {}
  };
}

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const isDev = mode === 'development' && process.env.STATOSCOPE_DEV;

function makeConfig(config: Configuration): Configuration {
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
          [require.resolve('@statoscope/stats-extension-compressed/dist/generator')]:
            false,
        },
      },
      cache: true,
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
              // @ts-ignore
              new Statoscope({
                // saveTo: `analyze/statoscope-[name]-[hash].html`,
                saveStatsTo: `analyze/stats.json`,
                open: 'file',
                watchMode: true,
                statsOptions: { all: true },
              }),
            ]
          : []),
        new webpack.EnvironmentPlugin({
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          STATOSCOPE_VERSION: require('./package.json').version,
        }),
      ],
    },
    config,
  );
}

export default makeConfig({
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
