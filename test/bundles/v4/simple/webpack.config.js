/* eslint-env node */

const path = require('path');
const Statoscope = require('../../../../packages/webpack-plugin').default;

const context = path.resolve(__dirname, '..');

module.exports = {
  entry() {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            one: './src/index.ts',
            two: './src/index2.ts',
          }),
        500
      );
    });
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
