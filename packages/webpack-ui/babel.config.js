/* globals module, process */

module.exports = (api) => {
  api.cache(() => process.env.NODE_ENV === 'production');

  return {
    presets: [
      [
        '@babel/env',
        {
          exclude: ['@babel/plugin-transform-regenerator'],
          modules: false,
        },
      ],
      '@babel/typescript',
    ],
  };
};
