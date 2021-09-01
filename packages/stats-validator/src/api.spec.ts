import { makeAPI } from './api';

test('error', () => {
  const api = makeAPI();

  api.message('foo-message');
  api.message('bar-message', { filename: 'foo-filename' });
  api.message('baz-message', {
    filename: 'foo-filename',
    compilation: 'foo-compilation',
    details: [{ type: 'text', content: 'foo' }],
    related: [
      { id: 'foo-module', type: 'module' },
      { id: 'foo-package', type: 'package' },
    ],
  });

  api.setRuleDescriptor({
    description: ' foo',
    package: { name: 'foo', version: '1.0.0' },
  });
  expect(api.getRuleDescriptor()).toMatchSnapshot();
  expect(api.getStorage()).toMatchSnapshot();
});
