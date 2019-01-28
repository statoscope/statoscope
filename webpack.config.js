const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  mode,
  devtool: 'source-map',
  entry: {
    main: './src/ui/index.js',
    discovery: '@discoveryjs/discovery/dist/lib.css'
  },
  output: {
    path: path.resolve('dist')
  },
  devServer: {
    port: 8888
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        include: /node_modules\/@discoveryjs/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              filename: 'discovery.css',
              publicPath: '../'
            }
          },
          'css-loader'
        ]
      },
      {
        test: /\.css$/,
        include: path.resolve('src'),
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      title: 'Webpack Runtime Analyzer',
      filename: 'index.html',
      template: './src/ui/index.html'
    })
  ]
};
