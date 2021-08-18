import { PackageDescriptor } from '@statoscope/stats/spec/extension';
import { RuleDescriptor, TestEntry } from '@statoscope/types/types/validation';
import APIFactory from './api';
import Generator from './generator';

const generator = new Generator();

const fooRule: RuleDescriptor = {
  description: 'foo-rule description',
  package: {
    name: 'foo-rule',
    version: '1.0.0',
    homepage: 'https://statoscope.tech',
  },
};
const fooMessage: TestEntry = {
  type: 'error',
  message: 'foo-message',
  compilation: 'foo-compilation',
  related: [
    { type: 'module', id: 'foo-foo-module' },
    { type: 'entry', id: 'foo-foo-entry' },
  ],
};

generator.handleRule('foo-rule', fooRule);

generator.handleEntry('foo-rule', fooMessage);

generator.handleEntry('foo-rule', {
  type: 'error',
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
  type: 'error',
  message: 'bar-message',
  compilation: 'bar-compilation',
  related: [
    { type: 'module', id: 'bar-foo-module' },
    { type: 'module', id: 'bar-bar-module' },
    { type: 'entry', id: 'bar-foo-entry' },
    { type: 'entry', id: 'bar-bar-entry' },
  ],
});

const data = generator.get();
const api = APIFactory(data);

test('getItemById', () => {
  expect(api.getItemById(100)).toBeNull();
  expect(api.getItemById(0)).toMatchObject({
    id: 0,
    rule: 'foo-rule',
    message: 'foo-message',
  });
});

test('getRule', () => {
  expect(api.getRule('bar-rule')).toBeNull();
  expect(api.getRule('foo-rule')).toBe(fooRule);
});

describe('getItems', () => {
  test('should return nothing', () => {
    expect(api.getItems('foo', 'entry')).toStrictEqual([]);
    expect(api.getItems('foo', 'entry', 'baz')).toStrictEqual([]);
    expect(api.getItems('foo-compilation', 'entry', 'bar')).toStrictEqual([]);
  });

  test('should return all entry-items', () => {
    expect(api.getItems('foo-compilation', 'entry')).toMatchSnapshot();
    expect(api.getItems('bar-compilation', 'entry')).toMatchSnapshot();
  });

  test('should return entry-item with specific id', () => {
    expect(api.getItems('foo-compilation', 'entry', 'foo-foo-entry')).toMatchSnapshot();
    expect(api.getItems('bar-compilation', 'entry', 'bar-foo-entry')).toMatchSnapshot();
  });

  test('should return all module-items', () => {
    expect(api.getItems('foo-compilation', 'module')).toMatchSnapshot();
    expect(api.getItems('bar-compilation', 'module')).toMatchSnapshot();
  });

  test('should return all items', () => {
    expect(api.getItems('foo-compilation')).toMatchSnapshot();
    expect(api.getItems('bar-compilation')).toMatchSnapshot();
  });

  test('should return module-item with specific id', () => {
    expect(api.getItems('foo-compilation', 'module', 'foo-foo-module')).toMatchSnapshot();
    expect(api.getItems('foo-compilation', 'module', 'foo-bar-module')).toMatchSnapshot();
    expect(api.getItems('bar-compilation', 'module', 'bar-foo-module')).toMatchSnapshot();
  });
});
