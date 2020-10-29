/* globals module, process */

module.exports = (api) => {
  api.cache(() => process.env.NODE_ENV === 'production');

  return {
    presets: [
      [
        '@babel/env',
        {
          // targets: 'last 1 Chrome version',
          modules: false,
        },
      ],
      '@babel/react',
    ],
  };
};
