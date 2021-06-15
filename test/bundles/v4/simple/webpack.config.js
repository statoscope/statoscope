/* eslint-env node */

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
  plugins: [new (require('../../../../packages/webpack-plugin').default)()],
  module: {
    rules: [
      {
        test: /\.(png|txt)/,
        use: require.resolve('file-loader'),
      },
      {
        test: /\.css$/,
        use: require.resolve('css-loader'),
      },
      {
        test: /\.ts$/,
        use: require.resolve('babel-loader'),
      },
    ],
  },
};
