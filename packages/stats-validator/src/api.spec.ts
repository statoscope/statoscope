import { makeAPI } from './api';

test('error', () => {
  const api = makeAPI();

  api.error('foo-message');
  api.error('bar-message', 'foo-filename');
  api.error('baz-message', {
    filename: 'foo-filename',
    compilation: 'foo-compilation',
    details: [{ type: 'text', content: 'foo' }],
    related: [
      { id: 'foo-module', type: 'module' },
      { id: 'foo-package', type: 'package' },
    ],
  });

  expect(api.getInfoTotal()).toBe(0);
  expect(api.getWarnTotal()).toBe(0);
  expect(api.getErrorTotal()).toBe(3);
  expect(api.hasErrors()).toBe(true);
  expect(api.getStorage()).toMatchSnapshot();
});

test('warn', () => {
  const api = makeAPI();

  api.warn('foo-message');
  api.warn('bar-message', 'foo-filename');
  api.warn('baz-message', {
    filename: 'foo-filename',
    compilation: 'foo-compilation',
    related: [
      { id: 'foo-module', type: 'module' },
      { id: 'foo-package', type: 'package' },
    ],
  });

  expect(api.getInfoTotal()).toBe(0);
  expect(api.getWarnTotal()).toBe(3);
  expect(api.getErrorTotal()).toBe(0);
  expect(api.hasErrors()).toBe(false);
  expect(api.getStorage()).toMatchSnapshot();
});

test('warn as error', () => {
  const api = makeAPI({ warnAsError: true });

  api.warn('foo-message');
  api.warn('bar-message', 'foo-filename');
  api.warn('baz-message', {
    filename: 'foo-filename',
    compilation: 'foo-compilation',
    related: [
      { id: 'foo-module', type: 'module' },
      { id: 'foo-package', type: 'package' },
    ],
  });

  expect(api.getInfoTotal()).toBe(0);
  expect(api.getWarnTotal()).toBe(3);
  expect(api.getErrorTotal()).toBe(0);
  expect(api.hasErrors()).toBe(true);
  expect(api.getStorage()).toMatchSnapshot();
});

test('info', () => {
  const api = makeAPI();

  api.info('foo-message');
  api.info('bar-message', 'foo-filename');
  api.info('baz-message', {
    filename: 'foo-filename',
    compilation: 'foo-compilation',
    related: [
      { id: 'foo-module', type: 'module' },
      { id: 'foo-package', type: 'package' },
    ],
  });

  expect(api.getInfoTotal()).toBe(3);
  expect(api.getWarnTotal()).toBe(0);
  expect(api.getErrorTotal()).toBe(0);
  expect(api.hasErrors()).toBe(false);
  expect(api.getStorage()).toMatchSnapshot();
});
