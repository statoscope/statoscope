import Ajv from 'ajv';
import schema from '../schema/stats.json';

export default function validateStats(stats) {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(stats);

  if (!valid) {
    return { result: false, errors: validate.errors };
  }

  return { result: true };
}
