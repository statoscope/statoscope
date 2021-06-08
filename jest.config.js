/* eslint-env node */

module.exports = {
  coverageDirectory: './coverage/',
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageProvider: 'v8',
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
