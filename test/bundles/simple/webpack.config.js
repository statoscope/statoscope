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
  plugins: [],
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
