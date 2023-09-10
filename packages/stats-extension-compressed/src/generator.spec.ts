import { ExtensionDescriptor } from '@statoscope/stats/spec/extension';
import Generator, { CompressFunction } from './generator';

const adapter: ExtensionDescriptor = { name: 'test-adapter', version: '7.7.7' };

jest.mock('../package.json', () => ({
  ...jest.requireActual('../package.json'),
  version: '8.8.8',
}));

describe('preset compressor', () => {
  test('gzip', () => {
    const generator = new Generator(adapter);
    generator.handleResource(
      'foo-compilation',
      'foo-resource',
      'foo-foo-content',
      'gzip',
    );
    generator.handleResource(
      'foo-compilation',
      'bar-resource',
      'foo-bar-content'.repeat(10),
      'gzip',
    );
    generator.handleResource(
      'bar-compilation',
      'foo-resource',
      'bar-foo-content'.repeat(100),
      'gzip',
    );
    generator.handleResource(
      'bar-compilation',
      'bar-resource',
      'bar-foo-content'.repeat(100),
      ['gzip', { level: 1 }],
    );

    expect(generator.get()).toMatchSnapshot();
  });

  test('unknown compressor', () => {
    const generator = new Generator(adapter);
    expect(
      generator.handleResource.bind(
        generator,
        'foo-compilation',
        'foo-resource',
        'foo-foo-content',
        'foo',
      ),
    ).toThrow('Unknown compress foo');
  });
});

test('custom compressor', () => {
  const generator = new Generator(adapter);
  const compressor1: CompressFunction = () => {
    return { compressor: 'custom-compressor', size: 100 };
  };
  const compressor2: CompressFunction = () => {
    return { compressor: { name: 'custom-compressor', version: '7.7.7' }, size: 100 };
  };
  const mockedCompressor1 = jest.fn(compressor1);
  const mockedCompressor2 = jest.fn(compressor2);
  generator.handleResource(
    'foo-compilation',
    'foo-resource',
    'foo-foo-content',
    mockedCompressor1,
  );
  generator.handleResource(
    'foo-compilation',
    'bar-resource',
    'foo-bar-content',
    mockedCompressor1,
  );
  generator.handleResource(
    'bar-compilation',
    'foo-resource',
    'bar-foo-content',
    mockedCompressor2,
  );

  expect(generator.get()).toMatchSnapshot();
  expect(mockedCompressor1.mock).toMatchSnapshot();
  expect(mockedCompressor2.mock).toMatchSnapshot();
});
