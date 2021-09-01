import { serializeSolutionPath } from '../../../../test/helpers';
import Graph from './';

test('makeNode', () => {
  const graph = new Graph();
  const foo = graph.makeNode('foo', 'foo data');

  expect(foo.id).toBe('foo');
  expect(foo.data).toBe('foo data');
});

test('hasNode', () => {
  const graph = new Graph();
  const graph2 = new Graph();

  graph.makeNode('foo', 'foo data');
  graph2.makeNode('bar', 'bar data');

  expect(graph.hasNode('foo')).toBe(true);
  expect(graph.hasNode('bar')).toBe(false);

  expect(graph2.hasNode('foo')).toBe(false);
  expect(graph2.hasNode('bar')).toBe(true);
});

test('getNode', () => {
  const graph = new Graph();
  const foo = graph.makeNode('foo', 'foo data');
  const bar = graph.makeNode('bar', 'bar data');

  expect(graph.getNode('fff')).toBeNull();
  expect(graph.getNode('foo')).toEqual(foo);
  expect(graph.getNode('bar')).toEqual(bar);
});

test('addChild', () => {
  const graph = new Graph();
  const foo = graph.makeNode('foo', 'foo data');
  const bar = graph.makeNode('bar', 'bar data');
  const baz = graph.makeNode('baz', 'baz data');

  graph.addChild(baz, foo);
  bar.addChild(baz);

  expect([...baz.parents]).toEqual([foo, bar]);
  expect([...foo.children]).toEqual([baz]);
  expect([...bar.children]).toEqual([baz]);
});

test('findPaths', () => {
  const graph = new Graph();
  const target = graph.makeNode('target', 'target data');
  const foo = graph.makeNode('foo', 'foo data');
  const bar = graph.makeNode('bar', 'bar data');
  const baz = graph.makeNode('baz', 'baz data');

  graph.addChild(baz, foo);
  graph.addChild(baz, bar);

  graph.addChild(foo, target);

  expect(serializeSolutionPath(graph.findPaths(baz, target))).toMatchSnapshot();

  graph.addChild(bar, target);

  expect(serializeSolutionPath(graph.findPaths(baz, target))).toMatchSnapshot();
  expect(serializeSolutionPath(baz.findPathsTo(target, 1))).toMatchSnapshot();
});
