import make from './entity-resolver';

const foo = { id: 1, data: 'foo' };
const bar = { id: 2, data: 'bar' };

test.each([
  {
    name: 'array',
    data: [foo, bar],
  },
  {
    name: 'set',
    data: new Set([foo, bar]),
  },
  {
    name: 'map',
    data: new Map([
      [1, foo],
      [2, bar],
    ]),
  },
  {
    name: 'record',
    data: {
      1: foo,
      2: bar,
    },
  },
])('should resolve: $name', ({ data }) => {
  const resolve = make(data, (item) => item.id);

  expect(resolve(3)).toBeNull();
  expect(resolve(1)?.data).toBe('foo');
  // @ts-ignore
  expect(resolve('1')?.data).toBe('foo');
  expect(resolve(2)?.data).toBe('bar');
});
