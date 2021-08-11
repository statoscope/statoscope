import path from 'path';
import os from 'os';
import { transform as transformOriginal } from '@statoscope/report-writer/dist/utils';

export async function transform(from: string[], to?: string): Promise<string> {
  const id = path.basename(from[0], '.json');
  const reportPath =
    to || path.join(os.tmpdir(), `statoscope-report-${id}-${Date.now()}.html`);
  return transformOriginal(
    {
      writer: {
        scripts: [{ type: 'path', path: require.resolve('@statoscope/webpack-ui') }],
        init: `function (data) {
          Statoscope.default(data.map((item) => ({ name: item.id, data: item.data })));
        }`,
      },
    },
    from,
    reportPath
  );
}
