import APIFactory from './api';
import Generator from './generator';

test('should work', () => {
  const generator = new Generator();

  generator.handleInstance('foo-compilation', 'foo-package', 'foo-instance', {
    version: '1.0.0',
  });
  generator.handleInstance('foo-compilation', 'foo-package', 'bar-instance', {
    version: '2.0.0',
  });
  generator.handleInstance('foo-compilation', 'bar-package', 'bar-instance', {
    version: '3.0.0',
  });
  generator.handleInstance('bar-compilation', 'foo-package', 'bar-instance', {
    version: '4.0.0',
  });

  const data = generator.get();
  const api = APIFactory(data);

  expect(api.getPackage('foo', 'bar')).toBeNull();
  expect(api.getPackage('foo-compilation', 'bar')).toBeNull();
  expect(api.getPackage('foo-compilation', 'foo-package')).toMatchSnapshot();
  expect(api.getPackage('foo-compilation', 'bar-package')).toMatchSnapshot();
  expect(api.getPackage('bar-compilation', 'foo-package')).toMatchSnapshot();

  expect(api.getInstance('foo', 'bar', 'bar')).toBeNull();
  expect(api.getInstance('foo-compilation', 'bar', 'baz')).toBeNull();
  expect(api.getInstance('foo-compilation', 'foo-package', 'bar')).toBeNull();
  expect(
    api.getInstance('foo-compilation', 'foo-package', 'foo-instance')
  ).toMatchSnapshot();
  expect(
    api.getInstance('foo-compilation', 'foo-package', 'bar-instance')
  ).toMatchSnapshot();
  expect(
    api.getInstance('foo-compilation', 'bar-package', 'bar-instance')
  ).toMatchSnapshot();
  expect(
    api.getInstance('bar-compilation', 'foo-package', 'bar-instance')
  ).toMatchSnapshot();
});
