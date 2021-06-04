import Ajv, { ErrorObject } from 'ajv';
import { Webpack } from '../webpack';
import schema from './schema/stats.json';

export type ValidationResult =
  | {
      result: false;
      errors: ErrorObject[];
    }
  | { result: true };

export default function validateStats(stats: Webpack.Compilation): ValidationResult {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(stats);

  if (!valid) {
    return { result: false, errors: validate.errors as ErrorObject[] };
  }

  return { result: true };
}
