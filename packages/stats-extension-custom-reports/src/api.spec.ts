import APIFactory from './api';
import Generator from './generator';

test('should work', () => {
  const generator = new Generator();

  generator.handleReport({
    context: 'context',
    data: 'data',
    id: 'foo',
    name: 'name',
    view: ['some-ui'],
  });

  generator.handleReport({
    context: 'context2',
    data: 'data2',
    id: 'foo2',
    name: 'name2',
    view: ['some-ui2'],
  });

  generator.handleReport({
    context: 'context3',
    data: 'data3',
    id: 'foo3',
    name: 'name3',
    view: ['some-ui3'],
    relations: [{ type: 'module', id: 'foo' }],
  });

  generator.handleReport({
    context: 'context4',
    data: 'data4',
    id: 'foo4',
    name: 'name4',
    view: ['some-ui4'],
    relations: [{ type: 'module', id: 'foo' }],
  });

  generator.handleReport({
    context: 'context5',
    data: 'data5',
    id: 'foo5',
    name: 'name5',
    view: ['some-ui5'],
    relations: [{ type: 'module', id: 'bar' }],
  });

  generator.handleReport({
    context: 'context6',
    data: 'data6',
    id: 'foo6',
    name: 'name6',
    view: ['some-ui6'],
    relations: [{ type: 'chunk', id: 'foo' }],
  });

  generator.handleReport({
    context: 'context7',
    data: 'data7',
    id: 'foo7',
    name: 'name7',
    view: ['some-ui7'],
    compilation: 'foo-compilation',
    relations: [{ type: 'chunk', id: 'foo' }],
  });

  const data = generator.get();
  const api = APIFactory(data);

  expect(api.getReports()).toMatchSnapshot();
  expect(api.getReports(null, 'package')).toEqual([]);
  expect(api.getReports(null, 'module')).toMatchSnapshot();
  expect(api.getReports(null, 'module', 'baz')).toEqual([]);
  expect(api.getReports(null, 'module', 'foo')).toMatchSnapshot();
  expect(api.getReports(null, 'module', 'bar')).toMatchSnapshot();
  expect(api.getReports(null, 'chunk')).toMatchSnapshot();
  expect(api.getReports(null, 'chunk', 'foo')).toMatchSnapshot();
  expect(api.getReports('foo-compilation')).toMatchSnapshot();
  expect(api.getReports('foo-compilation', 'chunk')).toMatchSnapshot();
  expect(api.getReports('foo-compilation', 'module')).toEqual([]);
  expect(api.getReports('foo-compilation', 'chunk', 'foo')).toMatchSnapshot();
  expect(api.getReports('foo-compilation', 'module', 'foo')).toEqual([]);
  expect(api.getById('foo')).toMatchSnapshot();
  expect(api.getById('foo2')).toMatchSnapshot();
  expect(api.getById('foo777')).toBeNull();
});
