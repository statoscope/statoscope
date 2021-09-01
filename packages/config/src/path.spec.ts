import path from 'path';
import { normalizePath, resolveAliasPackage } from './path';

const rootDir = path.resolve(__filename, '../../../..');
const fixtureDir = path.resolve(__filename, '../../../../test/fixtures/config');

function normalize(path: string): string {
  return path.replace(rootDir, '');
}

describe('resolveAliasPackage', () => {
  test('should work', () => {
    expect(
      normalize(
        resolveAliasPackage(
          ['stats-validator-reporter', 'statoscope-stats-validator-reporter'],
          '1',
          fixtureDir
        )
      )
    ).toMatchInlineSnapshot(`"statoscope-stats-validator-reporter-1"`);
    expect(
      normalize(
        resolveAliasPackage(['@statoscope/stats-validator-reporter'], '1', fixtureDir)
      )
    ).toMatchInlineSnapshot(`"@statoscope/stats-validator-reporter-1"`);
    expect(
      normalize(
        resolveAliasPackage(
          ['stats-validator-reporter', 'statoscope-stats-validator-reporter'],
          '@statoscope/1',
          fixtureDir
        )
      )
    ).toMatchInlineSnapshot(`"@statoscope/stats-validator-reporter-1"`);
  });

  test('relative path', () => {
    expect(
      normalize(
        resolveAliasPackage(
          ['foo'],
          './node_modules/@statoscope/stats-validator-reporter-1',
          fixtureDir
        )
      )
    ).toMatchInlineSnapshot(`"./node_modules/@statoscope/stats-validator-reporter-1"`);
  });

  test('absolute path', () => {
    expect(
      normalize(
        resolveAliasPackage(
          ['foo'],
          path.join(fixtureDir, './node_modules/@statoscope/stats-validator-reporter-1'),
          fixtureDir
        )
      )
    ).toMatchInlineSnapshot(
      `"/test/fixtures/config/node_modules/@statoscope/stats-validator-reporter-1"`
    );
  });

  test('should throw', () => {
    expect(
      resolveAliasPackage.bind(
        null,
        ['stats-validator-reporter', 'statoscope-stats-validator-reporter'],
        '@statoscope/2',
        fixtureDir
      )
    ).toThrow();
  });
});

describe('normalizePath', () => {
  test('should work', () => {
    expect(normalizePath('<rootDir>/baz', 'foo/bar')).toBe('foo/bar/baz');
    expect(normalizePath('foo/bar/baz', 'fooo/barr')).toBe('foo/bar/baz');
  });
});
