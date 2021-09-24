import make from './indexer';

const foo = { id: 1, data: 'foo' };
const bar = { id: 2, data: 'bar' };
const baz = { id: 3, data: 'baz' };

test('should resolve: $name', () => {
  const index = make((item) => item.id, [foo, bar]);

  expect(index.get(3)).toBeNull();
  expect(index.has(baz)).toBe(false);
  expect(index.hasId(3)).toBe(false);
  expect(index.get(1)?.data).toBe('foo');
  // @ts-ignore
  expect(index.get('1')?.data).toBe('foo');
  expect(index.get(2)?.data).toBe('bar');
  index.add(baz);
  expect(index.get(3)?.data).toBe('baz');
  index.removeById(3);
  expect(index.get(3)).toBeNull();
  index.add(baz);
  index.remove(baz);
  expect(index.get(3)).toBeNull();
  expect(index.getAll()).toEqual([foo, bar]);
});
