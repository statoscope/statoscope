/* eslint-env node */

module.exports = {
  validate: {
    plugins: [['../../../../packages/stats-validator-plugin-webpack', 'webpack']],
    rules: {
      'webpack/restricted-modules': ['error', [/\/src\//]],
      'webpack/restricted-packages': ['error', ['foo']],
    },
  },

  ui: {
    customReports: [
      {
        id: 'top-20-biggest-modules',
        name: 'Top 20 biggest modules',
        data: { some: { custom: 'data' } },
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
  },
};
