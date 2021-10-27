import stats from '../../../test/bundles/v5/simple/stats-prod.json';
import { NormalizedModule, NormalizedReason } from '../types';
import { moduleReasonResource, moduleResource, nodeModule } from './module';

describe('moduleResource', () => {
  test('should work', () => {
    const resource = [];

    expect(moduleResource(null)).toBeNull();

    for (const module of stats.modules as unknown as NormalizedModule[]) {
      resource.push({
        before: module.name,
        after: moduleResource(module),
      });
    }

    expect(resource).toMatchSnapshot();
  });
});

describe('moduleResource', () => {
  test('should work', () => {
    const reasons = [];

    expect(moduleResource(null)).toBeNull();

    for (const module of stats.modules as unknown as NormalizedModule[]) {
      for (const reason of module.reasons) {
        reasons.push({
          before: reason.moduleName,
          after: moduleReasonResource(reason),
        });
      }
    }

    for (const chunk of stats.chunks) {
      for (const reason of chunk.origins as unknown as NormalizedReason[]) {
        reasons.push({
          before: reason.moduleName,
          after: moduleReasonResource(reason),
        });
      }
    }

    expect(reasons).toMatchSnapshot();
  });
});

describe('nodeModule', () => {
  test('should work', () => {
    expect(nodeModule(null)).toBeNull();

    expect(nodeModule('./node_modules/foo/src')).toMatchSnapshot();
    expect(nodeModule('./node_modules/@foo/bar/src')).toMatchSnapshot();

    expect(nodeModule('./node_modules/foo/node_modules/bar/src')).toMatchSnapshot();
    expect(nodeModule('./node_modules/foo/node_modules/@bar/baz/src')).toMatchSnapshot();

    expect(
      nodeModule('./node_modules/@foo/bar/node_modules/@baz/quux/src')
    ).toMatchSnapshot();
  });
});
