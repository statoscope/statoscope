import APIFactory from './api';
import Generator from './generator';

test('should work', () => {
  const generator = new Generator();
  generator.handleResource('foo-compilation', 'foo-resource', 'foo-foo-content', 'gzip');
  generator.handleResource(
    'foo-compilation',
    'bar-resource',
    'foo-bar-content'.repeat(10),
    'gzip'
  );
  generator.handleResource(
    'bar-compilation',
    'foo-resource',
    'bar-foo-content'.repeat(100),
    'gzip'
  );

  const data = generator.get();
  const api = APIFactory(data);

  expect(api('foo', 'bar')).toBeNull();
  expect(api('foo-compilation', 'bar')).toBeNull();
  expect(api('foo-compilation', 'foo-resource')).toMatchInlineSnapshot(`
Object {
  "compressor": "gzip",
  "meta": Object {
    "level": 6,
  },
  "size": 33,
}
`);
  expect(api('foo-compilation', 'bar-resource')).toMatchInlineSnapshot(`
Object {
  "compressor": "gzip",
  "meta": Object {
    "level": 6,
  },
  "size": 38,
}
`);
  expect(api('bar-compilation', 'foo-resource')).toMatchInlineSnapshot(`
Object {
  "compressor": "gzip",
  "meta": Object {
    "level": 6,
  },
  "size": 48,
}
`);
});
