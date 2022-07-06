/* eslint-env node */

const path = require('path');
const Statoscope = require('../../../../packages/webpack-plugin').default;

const context = path.resolve(__dirname, '..');

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
    context,
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        foo: {
          chunks: 'all',
          test: /is-array/,
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new Statoscope({
      saveStatsTo:
        process.env.MODE === 'production' ? 'stats-prod.json' : 'stats-dev.json',
      open: false,
      statsOptions: {
        context,
      },
      reports: [
        {
          id: 'top-20-biggest-modules',
          name: 'Top 20 biggest modules',
          data: { some: { custom: 'data' } }, // or () => fetchAsyncData()
          view: [
            'struct',
            {
              data: `#.stats.compilations.(
            $compilation: $;
            modules.({
              module: $,
              hash: $compilation.hash,
              size: getModuleSize($compilation.hash)
            })
          ).sort(size.size desc)[:20]`,
              view: 'list',
              item: 'module-item',
            },
          ],
        },
      ],
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
