import { ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import Generator from './generator';

const adapter: ExtensionDescriptor = { name: 'test-adapter', version: '7.7.7' };

jest.mock('../package.json', () => ({
  ...jest.requireActual('../package.json'),
  version: '8.8.8',
}));

test('should work', () => {
  const generator = new Generator(adapter);

  generator.handleRule('foo-rule', {
    description: 'foo-description',
    package: {
      name: 'foo-package',
      version: '1.0.0',
      homepage: 'https://statoscope.tech',
    },
  });

  generator.handleEntry(
    'foo-rule',
    {
      message: 'foo-message',
      compilation: 'foo-compilation',
      related: [
        { type: 'module', id: 'foo-foo-module' },
        { type: 'entry', id: 'foo-foo-entry' },
      ],
    },
    'warn'
  );

  generator.handleEntry('foo-rule', {
    message: 'bar-message',
    compilation: 'foo-compilation',
    related: [
      { type: 'module', id: 'foo-foo-module' },
      { type: 'module', id: 'foo-bar-module' },
      { type: 'entry', id: 'foo-foo-entry' },
      { type: 'entry', id: 'foo-bar-entry' },
    ],
  });

  generator.handleEntry('foo-rule', {
    message: 'bar-message',
    compilation: 'bar-compilation',
    related: [
      { type: 'module', id: 'bar-foo-module' },
      { type: 'module', id: 'bar-bar-module' },
      { type: 'entry', id: 'bar-foo-entry' },
      { type: 'entry', id: 'bar-bar-entry' },
    ],
  });

  expect(generator.get()).toMatchSnapshot();
});
