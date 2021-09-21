/* globals module, process */

module.exports = (api) => {
  api.cache(() => process.env.NODE_ENV === 'production');

  return {
    presets: [
      '@babel/typescript',
      [
        '@babel/env',
        {
          modules: false,
        },
      ],
    ],
  };
};
