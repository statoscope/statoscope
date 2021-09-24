import { requireConfig } from './index';

describe('requireConfig', () => {
  test('should work', () => {
    expect(requireConfig()).toMatchSnapshot();
    expect(requireConfig('fooooo')).toMatchSnapshot();
    expect(
      requireConfig(require.resolve('../../../test/fixtures/cli/validate/config'))
    ).toMatchSnapshot();
  });
});
