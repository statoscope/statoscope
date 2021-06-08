import stats from '../../../test/bundles/simple/stats-prod.json';
import { moduleReasonResource, moduleResource, nodeModule } from './module';
import { NormalizedModule, NormalizedReason } from './normalize';

describe('moduleResource', () => {
  test('should work', () => {
    const resource = [];

    expect(moduleResource(null)).toBeNull();

    for (const module of stats.modules) {
      resource.push({
        before: module.name,
        after: moduleResource(module as unknown as NormalizedModule),
      });
    }

    expect(resource).toMatchSnapshot();
  });
});

describe('moduleResource', () => {
  test('should work', () => {
    const reasons = [];

    expect(moduleResource(null)).toBeNull();

    for (const module of stats.modules) {
      for (const reason of module.reasons) {
        reasons.push({
          before: reason.moduleName,
          after: moduleReasonResource(reason as unknown as NormalizedReason),
        });
      }
    }

    for (const chunk of stats.chunks) {
      for (const reason of chunk.origins) {
        reasons.push({
          before: reason.moduleName,
          after: moduleReasonResource(reason as unknown as NormalizedReason),
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
