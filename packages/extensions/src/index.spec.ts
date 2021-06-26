import Container, { APIFactory } from './';

test('should work', () => {
  type API = (name: string) => boolean;
  type Factory = APIFactory<string[], API>;
  const container = new Container();
  const factory: Factory =
    (data) =>
    (name): boolean =>
      data.includes(name);

  container.register('foo', 'bar', factory);
  expect(container.resolve('bar')).toBeNull();
  expect(container.resolve('foo')?.version).toBe('bar');
  const api = container.resolve('foo')?.apiFactory(['1', '2', '3']) as API;
  expect(api('7')).toBe(false);
  expect(api('2')).toBe(true);
});
