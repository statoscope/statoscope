/* eslint-env node */

const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  coverageDirectory: './coverage/',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'packages/*/src/**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/dist/**',
    '!**/*.spec.{js,ts}/**',
    '!**/*.d.ts',
    '!**/.eslintrc.js',
    '!**/webpack.config.js',
  ],
  roots: ['<rootDir>'],
  setupFilesAfterEnv: ['../../scripts/jest/setup'],
  modulePathIgnorePatterns: ['<rootDir>/../../dist/', '<rootDir>/dist/'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: [
          [
            '@babel/env',
            {
              exclude: ['@babel/plugin-transform-regenerator'],
              modules: 'commonjs',
            },
          ],
          '@babel/typescript',
        ],
      },
    ],
  },
};
