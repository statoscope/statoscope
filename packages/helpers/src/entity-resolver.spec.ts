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

test('getter', () => {
  const resolve = make(
    [foo, bar],
    (item) => item.id,
    (item) => item.data
  );

  expect(resolve(3)).toBeNull();
  expect(resolve(1)).toBe('foo');
  // @ts-ignore
  expect(resolve('1')).toBe('foo');
  expect(resolve(2)).toBe('bar');
});

describe('locking', () => {
  test('lock/unlock', () => {
    const list: Array<typeof foo | typeof bar> = [];
    const resolve = make(
      list,
      (item) => item.id,
      (item) => item.data,
      false
    );

    list.push(foo);
    resolve.lock();
    expect(resolve(1)).toBe('foo');
    list.push(bar);
    expect(resolve(2)).toBeNull();
    resolve.unlock();
    list.push(bar);
    expect(resolve(2)).toBe('bar');
  });

  test('locked by default', () => {
    const list: Array<typeof foo | typeof bar> = [];
    const resolve = make(
      list,
      (item) => item.id,
      (item) => item.data
    );

    list.push(foo);
    expect(resolve(1)).toBeNull();
    resolve.unlock();
    list.push(foo);
    expect(resolve(1)).toBe('foo');
  });
});
