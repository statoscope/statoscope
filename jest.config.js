/* eslint-env node */

module.exports = {
  coverageDirectory: './coverage/',
  preset: 'ts-jest',
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
};
