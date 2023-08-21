// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['prettier', 'import'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  env: {
    es6: true,
    browser: true,
  },
  overrides: [
    {
      parser: '@typescript-eslint/parser',
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-function-return-type': 'error',
        'no-case-declarations': 'off',
      },
      extends: [
        'eslint:recommended',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      plugins: ['prettier', 'import', '@typescript-eslint'],
    },
  ],
  rules: {
    'prettier/prettier': 'error',
    'prefer-const': 'error',
  },
};
