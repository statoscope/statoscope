import { Size } from '@statoscope/stats-extension-compressed/dist/generator';
import stats from '../../../test/bundles/v5/simple/stats-prod.json';
import { NormalizedModule } from '../types';
import convert from './modules-to-foam-tree';

test('should work', () => {
  const modules = stats.modules;

  expect(
    convert(
      modules as unknown as NormalizedModule[],
      (m): Size => ({
        size: m.size,
      })
    )
  ).toMatchSnapshot();
});
