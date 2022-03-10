import path from 'path';
import os from 'os';
import fs from 'fs';
import {
  FromItem,
  makeReplacer,
  transform as transformOriginal,
} from '@statoscope/report-writer/dist/utils';
import { parseChunked } from '@discoveryjs/json-ext';
import normalizeCompilation from '@statoscope/webpack-model/dist/normalizeCompilation';
import { Webpack } from '@statoscope/webpack-model/webpack';
import { Report } from '@statoscope/types/types/custom-report';
import { Config } from '@statoscope/types/types/config';
import { mergeReports } from './commands/injectReport';
import Compilation = Webpack.Compilation;

export type TransformFrom = {
  name: string;
  as: string;
};

export async function transform(
  from: Array<TransformFrom | string>,
  to: string,
  customReports: Report<unknown, unknown>[] = []
): Promise<string> {
  const normalizedFrom: FromItem[] = [];

  for (const item of from) {
    const filename = typeof item === 'string' ? item : item.name;
    const as = typeof item === 'string' ? item : item.as;
    let parsed: Compilation = await parseChunked(fs.createReadStream(filename));

    if (customReports.length) {
      parsed = mergeReports(customReports, parsed);
    }

    normalizeCompilation(parsed);

    normalizedFrom.push({
      type: 'data',
      filename: as,
      data: parsed,
      replacer: makeReplacer(parsed.__statoscope?.context, '.', ['context', 'source']),
    });
  }

  return transformOriginal(
    {
      writer: {
        scripts: [{ type: 'path', path: require.resolve('@statoscope/webpack-ui') }],
        init: `function (data) {
          Statoscope.default(data.map((item) => ({ name: item.id, data: item.data })));
        }`,
      },
    },
    normalizedFrom,
    to
  );
}

export const createDestStatReportPath = (from: string[], to?: string): string => {
  const id = path.basename(from[0], '.json');
  return to || path.join(os.tmpdir(), `statoscope-report-${id}-${Date.now()}.html`);
};

/**
 * Return true for objects with properties expected from custom report.
 * Type guard.
 */
export function isCustomReport(report: unknown): report is Report<unknown, unknown> {
  return !!(
    report &&
    typeof report === 'object' &&
    report.constructor === Object &&
    'id' in report &&
    'view' in report
  );
}

/**
 * Combine custom user reports from statoscope config and command arguments
 * (report json file paths).
 */
export function combineCustomReports(
  config: Config,
  reportArg: string[] = []
): Report<unknown, unknown>[] {
  const reports: Report<unknown, unknown>[] = [];

  if (reportArg) {
    const reportsFromFiles: unknown[] = reportArg.map((filepath) =>
      JSON.parse(fs.readFileSync(filepath, 'utf-8'))
    );

    for (const report in reportsFromFiles) {
      if (isCustomReport(report)) {
        reports.push(report);
      }
    }
  }

  if (config.reports) {
    reports.push(...config.reports);
  }

  return reports;
}
