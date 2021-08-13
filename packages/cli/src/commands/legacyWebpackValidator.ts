import fs from 'fs';
import path from 'path';
// @ts-ignore
import { parseChunked } from '@discoveryjs/json-ext';
import { NormalizedFile } from '@statoscope/webpack-model/dist/normalize';
import { makeAPI } from '@statoscope/stats-validator/dist/api';
import { prepareWithJora } from '@statoscope/webpack-model';
import {
  API,
  ValidationResult,
  TestEntry,
  Type as TestEntryType,
} from '@statoscope/types/types/validation';

export type WebpackRawValidatorInputData = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  files: Object[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  compilations: Object[];
  query: (query: string, data?: NormalizedFile[]) => unknown; // query-parameter is jora-syntax query
};
export type ValidatorFn = (
  data: WebpackRawValidatorInputData,
  api: API
) => Promise<string | void>;

export function makeQueryValidator(query: string): ValidatorFn {
  function validate(type?: string, message?: string): void {
    if (!(!type || type === 'error' || type === 'warn' || type === 'info')) {
      throw new Error(`Unknown message type [${type}]`);
    }

    if (!message) {
      throw new Error(`Message must be specified`);
    }
  }

  function callAPI(api: API, { type, filename, compilation, message }: TestEntry): void {
    validate(type, message);

    if (typeof type === 'undefined' || type === 'error') {
      api.error(message, { filename, compilation });
    } else if (type === 'warn') {
      api.warn(message, { filename, compilation });
    } else if (type === 'info') {
      api.info(message, { filename, compilation });
    } else {
      console.log('Unknown message type:', type);
      api.error(message, filename);
    }
  }

  return async (data, api): Promise<void> => {
    const result = data.query(query) as TestEntry[];

    for (const item of result) {
      let type: TestEntryType | undefined = item.type;

      if (!item.assert) {
        if (type === undefined && !Object.prototype.hasOwnProperty.call(item, 'assert')) {
          type = 'info';
        }

        callAPI(api, {
          type,
          message: item.message,
          filename: item.filename,
          compilation: item.compilation,
        });
      }
    }
  };
}

function handleValidator(validator: string): ValidatorFn {
  const validatorPath = path.resolve(validator);
  const ext = path.extname(validatorPath);
  let validatorFn: string | ValidatorFn;

  if (ext === '.js') {
    validatorFn = require(validatorPath);
  } else {
    validatorFn = fs.readFileSync(validatorPath, 'utf8');
  }

  if (typeof validatorFn === 'string') {
    validatorFn = makeQueryValidator(validatorFn);
  }

  return validatorFn;
}

export default async function validateWebpackStart(
  validatorPath: string,
  input: string,
  reference?: string | null,
  params?: { warnAsError: boolean }
): Promise<ValidationResult> {
  const files: Array<{ name: string; data: unknown }> = [];
  const inputData = await parseChunked(fs.createReadStream(input));
  files.push({
    name: 'input.json',
    data: inputData,
  });
  if (reference) {
    const referenceData = await parseChunked(fs.createReadStream(reference));
    files.push({
      name: 'reference.json',
      data: referenceData,
    });
  }
  // @ts-ignore
  const prepared = prepareWithJora(files);
  const validator = handleValidator(validatorPath);
  const api = makeAPI({ warnAsError: params?.warnAsError ?? false });

  await validator(
    {
      files: prepared.files,
      compilations: prepared.compilations,
      query: prepared.query,
    },
    api
  );

  return {
    rules: [{ name: path.resolve(validatorPath), api }],
    files: { input, reference },
  };
}
