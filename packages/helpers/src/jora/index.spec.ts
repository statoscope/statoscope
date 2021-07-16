import { TYPE_DC_HSPA_PLUS, TYPE_EDGE } from '../network-type-list';
import make from './';

const helpers = make();

test('stringify', () => {
  expect(helpers.stringify({ foo: 123 })).toMatchInlineSnapshot(`"{\\"foo\\":123}"`);
});
test('toNumber', () => {
  expect(helpers.toNumber('123')).toMatchInlineSnapshot(`123`);
});
test('formatSize', () => {
  expect(helpers.formatSize(100)).toMatchInlineSnapshot(`"0.10 kb"`);
  expect(helpers.formatSize(1024 * 2)).toMatchInlineSnapshot(`"2.00 kb"`);
  expect(helpers.formatSize(1024 ** 2 * 2)).toMatchInlineSnapshot(`"2.00 mb"`);
  expect(helpers.formatSize(1024 ** 3 * 2)).toMatchInlineSnapshot(`"2048.00 mb"`);
});
test('formatDate', () => {
  expect(helpers.formatDate(1624731388203, 'en-US')).toMatch(
    /6\/26\/2021, \d+:\d+:\d+ PM/
  );
});
test('formatDuration', () => {
  expect(helpers.formatDuration(100)).toMatchInlineSnapshot(`"100 ms"`);
  expect(helpers.formatDuration(1000)).toMatchInlineSnapshot(`"1.0 sec"`);
});
test('percentFrom', () => {
  expect(helpers.percentFrom(100, 50)).toMatchInlineSnapshot(`100`);
  expect(helpers.percentFrom(100, 0)).toMatchInlineSnapshot(`100`);
  expect(helpers.percentFrom(0, 100)).toMatchInlineSnapshot(`-100`);

  expect(helpers.percentFrom(50, 100)).toMatchInlineSnapshot(`-50`);
  expect(helpers.percentFrom(50, 0)).toMatchInlineSnapshot(`100`);
  expect(helpers.percentFrom(0, 50)).toMatchInlineSnapshot(`-100`);

  expect(helpers.percentFrom(100, 100)).toMatchInlineSnapshot(`0`);
  expect(helpers.percentFrom(0, 0)).toMatchInlineSnapshot(`0`);

  expect(helpers.percentFrom(100, 30, 2)).toMatchInlineSnapshot(`233.33`);
});
test('toFixed', () => {
  expect(helpers.toFixed(123.333)).toMatchInlineSnapshot(`"123.33"`);
  expect(helpers.toFixed(123.333, 1)).toMatchInlineSnapshot(`"123.3"`);
});
test('color', () => {
  expect(helpers.color('foo')).toMatchInlineSnapshot(`"hsl(54, 50%, 85%)"`);
  expect(helpers.color('bar')).toMatchInlineSnapshot(`"hsl(99, 50%, 85%)"`);
});
test('fileExt', () => {
  expect(helpers.fileExt('foo.js')).toMatchInlineSnapshot(`".js"`);
});
test('fileType', () => {
  expect(helpers.fileType('foo.js')).toMatchInlineSnapshot(`"script"`);
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
  expect(helpers.plural(0, ['one', 'many'])).toMatchInlineSnapshot(`"many"`);
  expect(helpers.plural(1, ['one', 'many'])).toMatchInlineSnapshot(`"one"`);
  expect(helpers.plural(2, ['one', 'many'])).toMatchInlineSnapshot(`"many"`);
});
test('pluralWithValue', () => {
  expect(helpers.pluralWithValue(0, ['one', 'many'])).toMatchInlineSnapshot(`"0 many"`);
  expect(helpers.pluralWithValue(1, ['one', 'many'])).toMatchInlineSnapshot(`"1 one"`);
  expect(helpers.pluralWithValue(2, ['one', 'many'])).toMatchInlineSnapshot(`"2 many"`);
});
test('pluralRus', () => {
  expect(helpers.pluralRus(0, ['модуль', 'модуля', 'модулей'])).toMatchInlineSnapshot(
    `"модулей"`
  );
  expect(helpers.pluralRus(1, ['модуль', 'модуля', 'модулей'])).toMatchInlineSnapshot(
    `"модуль"`
  );
  expect(helpers.pluralRus(2, ['модуль', 'модуля', 'модулей'])).toMatchInlineSnapshot(
    `"модуля"`
  );
  expect(helpers.pluralRus(5, ['модуль', 'модуля', 'модулей'])).toMatchInlineSnapshot(
    `"модулей"`
  );
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
  expect(helpers.getDownloadTime(100, TYPE_EDGE.name)).toMatchInlineSnapshot(
    `7.62939453125`
  );
  expect(helpers.getDownloadTime(10000, TYPE_EDGE.name)).toMatchInlineSnapshot(
    `762.939453125`
  );

  expect(helpers.getDownloadTime(100, TYPE_DC_HSPA_PLUS.name)).toMatchInlineSnapshot(
    `0.095367431640625`
  );
  expect(helpers.getDownloadTime(10000, TYPE_DC_HSPA_PLUS.name)).toMatchInlineSnapshot(
    `9.5367431640625`
  );
});
