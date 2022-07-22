import { TYPE_DC_HSPA_PLUS, TYPE_EDGE } from '../network-type-list';
import Graph from '../graph';
import { serializeSolutionPath } from '../../../../test/helpers';
import make, { prepareWithJora } from './';

const helpers = make();

test('stringify', () => {
  expect(helpers.stringify({ foo: 123 })).toMatchInlineSnapshot(`"{\\"foo\\":123}"`);
});
test('typeof', () => {
  expect(helpers.typeof('123')).toBe('string');
  expect(helpers.typeof(123)).toBe('number');
});
test('isNullish', () => {
  expect(helpers.isNullish(0)).toBe(false);
  expect(helpers.isNullish('')).toBe(false);
  expect(helpers.isNullish(void 0)).toBe(true);
  expect(helpers.isNullish(null)).toBe(true);
});
test('isArray', () => {
  expect(helpers.isArray(0)).toBe(false);
  expect(helpers.isArray('')).toBe(false);
  expect(helpers.isArray([])).toBe(true);
});
test('useNotNullish', () => {
  expect(helpers.useNotNullish([1, null])).toBe(1);
  expect(helpers.useNotNullish([null, null])).toBe(null);
  expect(helpers.useNotNullish([null, 1, 2])).toBe(1);
  expect(helpers.useNotNullish([1, 2, 3])).toBe(1);
});
test('serializeStringOrRegexp', () => {
  expect(helpers.serializeStringOrRegexp('foo')).toMatchInlineSnapshot(`
    Object {
      "content": "foo",
      "type": "string",
    }
  `);
  expect(helpers.serializeStringOrRegexp(/bar/)).toMatchInlineSnapshot(`
    Object {
      "content": "bar",
      "flags": "",
      "type": "regexp",
    }
  `);
  expect(helpers.serializeStringOrRegexp(/bar/i)).toMatchInlineSnapshot(`
    Object {
      "content": "bar",
      "flags": "i",
      "type": "regexp",
    }
  `);
});
test('deserializeStringOrRegexp', () => {
  expect(helpers.deserializeStringOrRegexp(helpers.serializeStringOrRegexp('foo'))).toBe(
    'foo'
  );
  expect('bar').toMatch(
    helpers.deserializeStringOrRegexp(helpers.serializeStringOrRegexp(/bar/))!
  );
  expect('BAr').toMatch(
    helpers.deserializeStringOrRegexp(helpers.serializeStringOrRegexp(/bar/i))!
  );
});
test('toNumber', () => {
  expect(helpers.toNumber('123')).toBe(123);
});
test('formatSize', () => {
  expect(helpers.formatSize(100)).toMatchInlineSnapshot(`"0.10 kb"`);
  expect(helpers.formatSize(1024 * 2)).toMatchInlineSnapshot(`"2.00 kb"`);
  expect(helpers.formatSize(1024 ** 2 * 2)).toMatchInlineSnapshot(`"2.00 mb"`);
  expect(helpers.formatSize(1024 ** 3 * 2)).toMatchInlineSnapshot(`"2048.00 mb"`);
});
test('formatDate', () => {
  expect(helpers.formatDate(1624731388203, 'en-US', { timeZone: 'UTC' })).toMatch(
    /6\/26\/2021, \d+:\d+:\d+ [AP]M/
  );
});
test('formatDuration', () => {
  expect(helpers.formatDuration(100)).toMatchInlineSnapshot(`"100 ms"`);
  expect(helpers.formatDuration(1000)).toMatchInlineSnapshot(`"1.0 sec"`);
});
test('percentFrom', () => {
  expect(helpers.percentFrom(100, 50)).toBe(100);
  expect(helpers.percentFrom(100, 0)).toBe(100);
  expect(helpers.percentFrom(0, 100)).toBe(-100);

  expect(helpers.percentFrom(50, 100)).toBe(-50);
  expect(helpers.percentFrom(50, 0)).toBe(100);
  expect(helpers.percentFrom(0, 50)).toBe(-100);

  expect(helpers.percentFrom(100, 100)).toBe(0);
  expect(helpers.percentFrom(0, 0)).toBe(0);

  expect(helpers.percentFrom(100, 30, 2)).toBe(233.33);
});
test('toFixed', () => {
  expect(helpers.toFixed(123.333)).toBe('123.33');
  expect(helpers.toFixed(123.333, 1)).toBe('123.3');
});
test('color', () => {
  expect(helpers.color('foo')).toMatchInlineSnapshot(`"hsl(54, 50%, 85%)"`);
  expect(helpers.color('bar')).toMatchInlineSnapshot(`"hsl(99, 50%, 85%)"`);
});
test('fileExt', () => {
  expect(helpers.fileExt('foo.js')).toBe('.js');
});
test('fileType', () => {
  expect(helpers.fileType('foo.js')).toBe('script');
});
test('toMatchRegexp', () => {
  expect(helpers.toMatchRegexp('123', /\d+/)).toMatchInlineSnapshot(`true`);
  expect(helpers.toMatchRegexp('abc', /\d+/)).toMatchInlineSnapshot(`false`);
});
test('toRegexp', () => {
  expect(helpers.toRegexp('foo.bar')).toMatchInlineSnapshot(`/\\(foo\\.bar\\)/`);
});
test('colorFromH', () => {
  expect(helpers.colorFromH(54)).toMatchInlineSnapshot(`"hsl(54, 50%, 85%)"`);
  expect(helpers.colorFromH(99)).toMatchInlineSnapshot(`"hsl(99, 50%, 85%)"`);
});
test('plural', () => {
  expect(helpers.plural(0, ['one', 'many'])).toBe('many');
  expect(helpers.plural(1, ['one', 'many'])).toBe('one');
  expect(helpers.plural(2, ['one', 'many'])).toBe('many');
});
test('pluralWithValue', () => {
  expect(helpers.pluralWithValue(0, ['one', 'many'])).toBe('0 many');
  expect(helpers.pluralWithValue(1, ['one', 'many'])).toBe('1 one');
  expect(helpers.pluralWithValue(2, ['one', 'many'])).toBe('2 many');
});
test('pluralRus', () => {
  expect(helpers.pluralRus(0, ['модуль', 'модуля', 'модулей'])).toBe('модулей');
  expect(helpers.pluralRus(1, ['модуль', 'модуля', 'модулей'])).toBe('модуль');
  expect(helpers.pluralRus(2, ['модуль', 'модуля', 'модулей'])).toBe('модуля');
  expect(helpers.pluralRus(5, ['модуль', 'модуля', 'модулей'])).toBe('модулей');
});
test('pluralWithValueRus', () => {
  expect(
    helpers.pluralWithValueRus(0, ['модуль', 'модуля', 'модулей'])
  ).toMatchInlineSnapshot(`"0 модулей"`);
  expect(
    helpers.pluralWithValueRus(1, ['модуль', 'модуля', 'модулей'])
  ).toMatchInlineSnapshot(`"1 модуль"`);
  expect(
    helpers.pluralWithValueRus(2, ['модуль', 'модуля', 'модулей'])
  ).toMatchInlineSnapshot(`"2 модуля"`);
  expect(
    helpers.pluralWithValueRus(5, ['модуль', 'модуля', 'модулей'])
  ).toMatchInlineSnapshot(`"5 модулей"`);
});
test('getNetworkTypeInfo', () => {
  expect(helpers.getNetworkTypeInfo(TYPE_DC_HSPA_PLUS.name)).toMatchInlineSnapshot(`
    Object {
      "name": "DC-HSPA+",
      "type": "3G",
      "typicalSpeed": 1048576,
    }
  `);
});
test('getNetworkTypeName', () => {
  expect(helpers.getNetworkTypeName(TYPE_DC_HSPA_PLUS)).toMatchInlineSnapshot(
    `"3G: DC-HSPA+ (8 MBit/s)"`
  );
});
test('getDownloadTime', () => {
  expect(helpers.getDownloadTime(100, TYPE_EDGE.name)).toBe(7.62939453125);
  expect(helpers.getDownloadTime(10000, TYPE_EDGE.name)).toBe(762.939453125);

  expect(helpers.getDownloadTime(100, TYPE_DC_HSPA_PLUS.name)).toBe(0.095367431640625);
  expect(helpers.getDownloadTime(10000, TYPE_DC_HSPA_PLUS.name)).toBe(9.5367431640625);
});

test('formatDiff', () => {
  expect(helpers.formatDiff({ type: 'number', a: 10, b: 20 })).toMatchInlineSnapshot(
    `"10"`
  );
  expect(helpers.formatDiff({ type: 'number', a: 20, b: 10 })).toMatchInlineSnapshot(
    `"-10"`
  );
  expect(
    helpers.formatDiff({ type: 'version', a: '1.1.2', b: '2.0.0' })
  ).toMatchInlineSnapshot(`"major upgrade from 1.1.2"`);
  expect(
    helpers.formatDiff({ type: 'version', a: '2.1.2', b: '1.0.0' })
  ).toMatchInlineSnapshot(`"major downgrade from 2.1.2"`);
  expect(helpers.formatDiff({ type: 'size', a: 50, b: 100 })).toMatchInlineSnapshot(
    `"0.05 kb"`
  );
  expect(helpers.formatDiff({ type: 'size', a: 100, b: 50 })).toMatchInlineSnapshot(
    `"-0.05 kb"`
  );
  expect(helpers.formatDiff({ type: 'time', a: 50, b: 100 })).toMatchInlineSnapshot(
    `"50 ms"`
  );
  expect(helpers.formatDiff({ type: 'time', a: 100, b: 50 })).toMatchInlineSnapshot(
    `"-50 ms"`
  );
});
test('isMatch', () => {
  expect(helpers.isMatch()).toMatchInlineSnapshot(`true`);
  expect(helpers.isMatch(void 0, 'foo')).toBe(false);
  expect(helpers.isMatch('foo', void 0)).toBe(false);
  expect(helpers.isMatch('foo', 'foo')).toBe(true);
  expect(helpers.isMatch('foo', 'fo')).toBe(false);
  expect(helpers.isMatch('foo', /fo/)).toBe(true);
  expect(helpers.isMatch('foo', /fooo/)).toBe(false);
});
test('exclude', () => {
  expect(helpers.exclude(['1', '2', '2', '3', '4444', '5'], { exclude: ['2', /4/] }))
    .toMatchInlineSnapshot(`
    Array [
      "1",
      "3",
      "5",
    ]
  `);
  expect(helpers.exclude(['1', '2', '2', '3', '4444', '5'], { exclude: [] }))
    .toMatchInlineSnapshot(`
    Array [
      "1",
      "2",
      "2",
      "3",
      "4444",
      "5",
    ]
  `);
  expect(
    helpers.exclude(
      [
        { foo: '1' },
        { foo: '2' },
        { foo: '2' },
        { foo: '3' },
        { foo: '4444' },
        { foo: '5' },
      ],

      { exclude: ['2', /4/], get: (item) => item.foo }
    )
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "foo": "1",
      },
      Object {
        "foo": "3",
      },
      Object {
        "foo": "5",
      },
    ]
  `);
});

test('diff_normalizeLimit', () => {
  expect(helpers.diff_normalizeLimit()).toBeNull();
  expect(helpers.diff_normalizeLimit(null)).toBeNull();
  expect(helpers.diff_normalizeLimit(10)).toMatchInlineSnapshot(`
    Object {
      "number": 10,
      "type": "absolute",
    }
  `);
  expect(helpers.diff_normalizeLimit({ type: 'absolute', number: 10 }))
    .toMatchInlineSnapshot(`
    Object {
      "number": 10,
      "type": "absolute",
    }
  `);
});
test('diff_isLTETheLimit', () => {
  expect(helpers.diff_isLTETheLimit({ percent: 10, absolute: 100 })).toBe(true);
  expect(helpers.diff_isLTETheLimit({ percent: 10, absolute: 100 }, null)).toBe(true);
  expect(helpers.diff_isLTETheLimit({ percent: 10, absolute: 100 }, 100)).toBe(true);
  expect(helpers.diff_isLTETheLimit({ percent: 10, absolute: 100 }, 99)).toBe(false);
  expect(
    helpers.diff_isLTETheLimit(
      { percent: 10, absolute: 100 },
      { type: 'absolute', number: 100 }
    )
  ).toBe(true);
  expect(
    helpers.diff_isLTETheLimit(
      { percent: 10, absolute: 100 },
      { type: 'absolute', number: 99 }
    )
  ).toBe(false);
  expect(
    helpers.diff_isLTETheLimit(
      { percent: 10, absolute: 100 },
      { type: 'percent', number: 10 }
    )
  ).toBe(true);
  expect(
    helpers.diff_isLTETheLimit(
      { percent: 10, absolute: 100 },
      { type: 'percent', number: 9 }
    )
  ).toBe(false);
});

test('semverGT', () => {
  expect(helpers.semverGT('1.0.0', '0.5.0')).toBe(true);
  expect(helpers.semverGT('1.0.0', '1.0.0')).toBe(false);
  expect(helpers.semverGT('1.0.0', '1.5.0')).toBe(false);
});

test('semverGTE', () => {
  expect(helpers.semverGTE('1.0.0', '0.5.0')).toBe(true);
  expect(helpers.semverGTE('1.0.0', '1.0.0')).toBe(true);
  expect(helpers.semverGTE('1.0.0', '1.5.0')).toBe(false);
});

test('semverLT', () => {
  expect(helpers.semverLT('1.0.0', '0.5.0')).toBe(false);
  expect(helpers.semverLT('1.0.0', '1.0.0')).toBe(false);
  expect(helpers.semverLT('1.0.0', '1.5.0')).toBe(true);
});

test('semverLTE', () => {
  expect(helpers.semverLTE('1.0.0', '0.5.0')).toBe(false);
  expect(helpers.semverLTE('1.0.0', '1.0.0')).toBe(true);
  expect(helpers.semverLTE('1.0.0', '1.5.0')).toBe(true);
});

test('semverEQ', () => {
  expect(helpers.semverEQ('1.0.0', '0.5.0')).toBe(false);
  expect(helpers.semverEQ('1.0.0', '1.0.0')).toBe(true);
  expect(helpers.semverEQ('1.0.0', '1.5.0')).toBe(false);
});

test('semverDiff', () => {
  expect(helpers.semverDiff('1.0.0', '0.5.0')).toMatchInlineSnapshot(`"major"`);
  expect(helpers.semverDiff('1.0.0', '1.0.0')).toMatchInlineSnapshot(`null`);
  expect(helpers.semverDiff('1.0.0', '1.5.0')).toMatchInlineSnapshot(`"minor"`);
});

test('semverParse', () => {
  expect(helpers.semverParse('1.0.0')).toMatchInlineSnapshot(`
    SemVer {
      "build": Array [],
      "includePrerelease": false,
      "loose": false,
      "major": 1,
      "minor": 0,
      "options": Object {},
      "patch": 0,
      "prerelease": Array [],
      "raw": "1.0.0",
      "version": "1.0.0",
    }
  `);
  expect(helpers.semverParse('^1.0.0')).toMatchInlineSnapshot(`null`);
});

test('semverSatisfies', () => {
  expect(helpers.semverSatisfies('1.5.0', '^1.5.0')).toBe(true);
  expect(helpers.semverSatisfies('1.6.0', '^1.5.0')).toBe(true);
  expect(helpers.semverSatisfies('1.6.0', '~1.5.0')).toBe(false);
});

test('graph_getNode', () => {
  const graph = new Graph();
  const foo = graph.makeNode('foo', 'foo data');
  const bar = graph.makeNode('bar', 'bar data');

  expect(helpers.graph_getNode('fff', graph)).toBeNull();
  expect(helpers.graph_getNode('foo', graph)).toEqual(foo);
  expect(helpers.graph_getNode('bar', graph)).toEqual(bar);
});

test('graph_getPaths', () => {
  const graph = new Graph();
  const target = graph.makeNode('target', 'target data');
  const foo = graph.makeNode('foo', 'foo data');
  const bar = graph.makeNode('bar', 'bar data');
  const baz = graph.makeNode('baz', 'baz data');

  graph.addChild(baz, foo);
  graph.addChild(baz, bar);

  graph.addChild(foo, target);
  graph.addChild(bar, target);

  expect(
    serializeSolutionPath(helpers.graph_getPaths(baz, graph, target)!)
  ).toMatchSnapshot();
  expect(
    serializeSolutionPath(helpers.graph_getPaths(baz, graph, target, 1)!)
  ).toMatchSnapshot();
});

test('prepareWithJora', () => {
  let prepared = prepareWithJora({ foo: 123 });
  expect(prepared.query('foo')).toBe(123);
  expect(prepared.query('foo', { foo: 456 })).toBe(456);
  expect(prepared.query('#.foo', { foo: 456 }, { foo: 789 })).toBe(789);
  expect(prepared.query('#.foo', { foo: 456 }, { foo: 789 })).toBe(789);

  prepared = prepareWithJora(
    { foo: 'text' },
    {
      helpers: {
        bar(v: string) {
          return v.toUpperCase();
        },
      },
    }
  );
  expect(prepared.query('foo.bar()')).toBe('TEXT');
});
