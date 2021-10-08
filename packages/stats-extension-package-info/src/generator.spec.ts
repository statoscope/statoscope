import { ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import Generator from './generator';

const adapter: ExtensionDescriptor = { name: 'test-adapter', version: '7.7.7' };

jest.mock('../package.json', () => ({
  ...jest.requireActual('../package.json'),
  version: '8.8.8',
}));

test('should work', () => {
  const generator = new Generator(adapter);

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

  expect(generator.get()).toMatchSnapshot();
});
