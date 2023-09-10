import path from 'path';
import { normalizePath, PackageAliasType, resolveAliasPackage } from './path';

const rootDir = path.resolve(__filename, '../../../..');
const fixtureDir = path.resolve(__filename, '../../../../test/fixtures/config');

function normalize(path: string): string {
  return path.replace(rootDir, '');
}

const { PLUGIN: pluginType } = PackageAliasType;

describe('resolveAliasPackage', () => {
  describe('plugins behavior', () => {
    describe('resolves by full package name (no need to use prefixes)', () => {
      test('with random namespace and random name', () => {
        expect(
          normalize(resolveAliasPackage(pluginType, '@foo/bar', fixtureDir)),
        ).toMatchInlineSnapshot('"@foo/bar"');
      });

      test('with random namespace and expected (prefixed) name', () => {
        expect(
          normalize(
            resolveAliasPackage(
              pluginType,
              '@foo/statoscope-stats-validator-plugin-1',
              fixtureDir,
            ),
          ),
        ).toMatchInlineSnapshot('"@foo/statoscope-stats-validator-plugin-1"');
      });

      test('without namespace and random name', () => {
        expect(
          normalize(resolveAliasPackage(pluginType, 'foo', fixtureDir)),
        ).toMatchInlineSnapshot('"foo"');
      });

      test('without namespace and expected (prefixed) name', () => {
        expect(
          normalize(
            resolveAliasPackage(
              pluginType,
              'statoscope-stats-validator-plugin-1',
              fixtureDir,
            ),
          ),
        ).toMatchInlineSnapshot('"statoscope-stats-validator-plugin-1"');
      });

      test('with @statoscope namespace and random name', () => {
        expect(
          normalize(resolveAliasPackage(pluginType, '@statoscope/foo', fixtureDir)),
        ).toMatchInlineSnapshot('"@statoscope/foo"');
      });

      test('with @statoscope namespace and expected (prefixed) name', () => {
        expect(
          normalize(
            resolveAliasPackage(
              pluginType,
              '@statoscope/stats-validator-plugin-1',
              fixtureDir,
            ),
          ),
        ).toMatchInlineSnapshot('"@statoscope/stats-validator-plugin-1"');
      });
    });

    describe('resolves by short package name (which has to be prefixed)', () => {
      test('with @statoscope namespace and random name', () => {
        expect(
          normalize(resolveAliasPackage(pluginType, '@statoscope/1', fixtureDir)),
        ).toMatchInlineSnapshot('"@statoscope/stats-validator-plugin-1"');
      });

      test('with random namespace and random name', () => {
        expect(
          normalize(resolveAliasPackage(pluginType, '@foo/1', fixtureDir)),
        ).toMatchInlineSnapshot('"@foo/statoscope-stats-validator-plugin-1"');
      });

      test('wo namespace and with random name', () => {
        expect(
          normalize(resolveAliasPackage(pluginType, '1', fixtureDir)),
        ).toMatchInlineSnapshot('"statoscope-stats-validator-plugin-1"');
      });

      test("won't resolve without namespace and @statoscope specific prefix", () => {
        expect(() =>
          resolveAliasPackage(pluginType, 'wont-find', fixtureDir),
        ).toThrowErrorMatchingSnapshot();
      });

      test("won't resolve with @statoscope namespace and name with no (or custom) namespace prefix", () => {
        expect(() =>
          resolveAliasPackage(pluginType, '@statoscope/wont-find', fixtureDir),
        ).toThrowErrorMatchingSnapshot();
      });

      test("won't resolve with random namespace and @statoscope specific prefix", () => {
        expect(() =>
          resolveAliasPackage(pluginType, '@foo/wont-find', fixtureDir),
        ).toThrowErrorMatchingSnapshot();
      });
    });
  });

  test('throws when package is not found', () => {
    expect(() =>
      resolveAliasPackage(PackageAliasType.REPORTER, '@statoscope/2', fixtureDir),
    ).toThrowErrorMatchingSnapshot();
  });

  describe('relative path support', () => {
    test('resolves package by relative path', () => {
      expect(
        normalize(
          resolveAliasPackage(
            pluginType,
            './node_modules/@statoscope/stats-validator-reporter-1',
            fixtureDir,
          ),
        ),
      ).toMatchInlineSnapshot(`"./node_modules/@statoscope/stats-validator-reporter-1"`);
    });

    test('throws when package is not there', () => {
      expect(() =>
        resolveAliasPackage(
          pluginType,
          './node_modules/@statoscope/not-there',
          fixtureDir,
        ),
      ).toThrowErrorMatchingSnapshot();
    });
  });

  describe('absolute path support', () => {
    test('resolves package by absolute path', () => {
      expect(
        normalize(
          resolveAliasPackage(
            pluginType,
            path.join(
              fixtureDir,
              './node_modules/@statoscope/stats-validator-reporter-1',
            ),
            fixtureDir,
          ),
        ),
      ).toMatchInlineSnapshot(
        `"/test/fixtures/config/node_modules/@statoscope/stats-validator-reporter-1"`,
      );
    });

    test('throws when package is not there', () => {
      expect(() =>
        resolveAliasPackage(
          pluginType,
          path.join(fixtureDir, './node_modules/@statoscope/not-there'),
          fixtureDir,
        ),
      ).toThrow(); // can't use snapshot here because of the absolute path
    });
  });
});

describe('normalizePath', () => {
  test('basic functionality', () => {
    expect(normalizePath('<rootDir>/baz', 'foo/bar')).toBe('foo/bar/baz');
    expect(normalizePath('foo/bar/baz', 'fooo/barr')).toBe('foo/bar/baz');
  });
});
