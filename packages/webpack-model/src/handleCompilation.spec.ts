import normalize from './handleFile';
import stats from '../../../test/bundles/v5/simple/stats-prod.json';
const normalized = normalize({ name: 'stats.js', data: stats });
const firstFile = normalized.files[0];
const compilation = firstFile.compilations[0];

it('extractModulePackages', () => {
  expect(
    compilation.nodeModules.map((nm) => ({
      name: nm.name,
      instances: nm.instances.map((i) => ({
        modules: i.modules.map((m) => m.resolvedResource),
        reasons: i.reasons.map((r) => ({
          type: r.type,
          data: r.data.resolvedResource,
        })),
      })),
    }))
  ).toMatchSnapshot();
});
