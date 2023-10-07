import { requireConfig } from './';

describe('requireConfig', () => {
  test('should work', () => {
    let resolved = requireConfig();
    resolved.path = String(resolved.path).replace(process.cwd(), '<pwd>');
    expect(resolved).toMatchSnapshot();

    resolved = requireConfig('fooooo');
    resolved.path = String(resolved.path).replace(process.cwd(), '<pwd>');
    expect(resolved).toMatchSnapshot();

    resolved = requireConfig(
      require.resolve('../../../test/fixtures/cli/validate/config'),
    );
    resolved.path = String(resolved.path).replace(process.cwd(), '<pwd>');
    expect(resolved).toMatchSnapshot();
  });
});
