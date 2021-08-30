import Validator from './';

test('should work', async () => {
  const validator = new Validator({
    plugins: [[require.resolve('../../stats-validator-plugin-webpack'), 'webpack']],
    rules: {
      'webpack/restricted-modules': ['error', [/\.\/src/]],
      'webpack/restricted-packages': ['error', ['foo']],
    },
  });

  const result = await validator.validate(
    require.resolve('../../../test/bundles/simple/stats-prod.json')
  );

  result.files.input = result.files.input.replace(process.cwd(), '<pwd>');
  expect(result).toMatchSnapshot();
});

test('custom reporter', async () => {
  const validator = new Validator({
    plugins: [[require.resolve('../../stats-validator-plugin-webpack'), 'webpack']],
    reporters: [
      [
        require.resolve('../../../test/fixtures/stats-validator/reporters/custom.js'),
        'foo',
      ],
    ],
    rules: {
      'webpack/restricted-modules': ['error', [/\.\/src/]],
      'webpack/restricted-packages': ['error', ['foo']],
    },
  });

  const result = await validator.validate(
    require.resolve('../../../test/bundles/simple/stats-prod.json')
  );

  result.files.input = result.files.input.replace(process.cwd(), '<pwd>');
  expect(result).toMatchSnapshot();
});

test('silent', async () => {
  const validator = new Validator({
    plugins: [[require.resolve('../../stats-validator-plugin-webpack'), 'webpack']],
    reporters: [
      [
        require.resolve('../../../test/fixtures/stats-validator/reporters/custom.js'),
        'foo',
      ],
    ],
    silent: true,
    rules: {
      'webpack/restricted-modules': ['error', [/\.\/src/]],
      'webpack/restricted-packages': ['error', ['foo']],
    },
  });

  const result = await validator.validate(
    require.resolve('../../../test/bundles/simple/stats-prod.json')
  );

  result.files.input = result.files.input.replace(process.cwd(), '<pwd>');
  expect(result).toMatchSnapshot();
});
