import stats from '../../../test/bundles/simple/stats-prod.json';
import { moduleResource } from './module';
import { NormalizedModule } from './normalize';

describe('moduleResource', () => {
  test('should work', () => {
    expect(moduleResource(null)).toBeNull();
    const resource = [];

    for (const module of stats.modules) {
      resource.push(moduleResource(module as unknown as NormalizedModule));
    }
    expect(resource).toMatchInlineSnapshot(`
Array [
  "src/index.ts",
  "src/index2.ts",
  "src/sub-module.ts",
  "src/index2.css",
  "external \\"extLib\\"",
  "src/test.txt",
  "node_modules/foo/index.js",
  "node_modules/bar/index.js",
  "../node_modules/css-loader/dist/runtime/api.js",
  "../node_modules/css-loader/dist/runtime/getUrl.js",
  "src/statoscope.png",
  "webpack/runtime/compat get default export",
  "webpack/runtime/define property getters",
  "webpack/runtime/define property getters",
  "webpack/runtime/global",
  "webpack/runtime/hasOwnProperty shorthand",
  "webpack/runtime/hasOwnProperty shorthand",
  "webpack/runtime/jsonp chunk loading",
  "webpack/runtime/make namespace object",
  "webpack/runtime/publicPath",
]
`);
  });
});
