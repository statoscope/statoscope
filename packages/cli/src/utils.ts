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
import Generator, {
  Payload,
} from '@statoscope/stats-extension-custom-reports/dist/generator';
import Compilation = Webpack.Compilation;

export type TransformFrom = {
  name: string;
  as: string;
};

export function mergeCustomReportsIntoCompilation(
  parsed: Webpack.Compilation,
  reports: unknown[]
): Webpack.Compilation {
  parsed.__statoscope ??= {};
  parsed.__statoscope.extensions ??= [];
  const customReportsExtensionIx = parsed.__statoscope.extensions.findIndex(
    (ext) => ext.descriptor.name === '@statoscope/stats-extension-custom-reports'
  );
  const customReportsExtension =
    customReportsExtensionIx > -1
      ? parsed.__statoscope.extensions[customReportsExtensionIx]
      : null;
  const customReportGenerator = new Generator();
  if (customReportsExtension?.payload) {
    const payload = customReportsExtension.payload as Payload;

    for (const compilationItem of payload.compilations) {
      for (const report of compilationItem.reports) {
        customReportGenerator.handleReport(report);
      }
    }
  }

  for (const report of reports) {
    if (isCustomReport(report)) {
      customReportGenerator.handleReport(report);
    } else {
      throw new Error(
        `Can't add a report. A valid report should contain id and view fields`
      );
    }
  }

  if (customReportsExtension) {
    parsed.__statoscope.extensions.splice(customReportsExtensionIx, 1);
  }

  parsed.__statoscope.extensions.push(customReportGenerator.get());

  return parsed;
}

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
      parsed = mergeCustomReportsIntoCompilation(parsed, customReports);
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
    let malformedReport = false;

    const reportsFromFiles: unknown[] = reportArg
      .map((filepath) => require(path.resolve(filepath)))
      .flat();

    for (const report of reportsFromFiles) {
      if (isCustomReport(report)) {
        reports.push(report);
      } else {
        malformedReport = true;
      }
    }

    if (malformedReport) {
      console.warn('One or more custom reports from files passed are malformed');
    }
  }

  if (config.generate?.reports) {
    reports.push(...config.generate.reports);
  }

  return reports;
}
