import { transform as transformOriginal } from '@statoscope/report-writer/dist/utils';

export async function transform(from: string[], to?: string): Promise<string> {
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
    to
  );
}
