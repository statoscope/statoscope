import { validate } from 'schema-utils';
import schema from '../schema/stats.json';

export default function validateStats(stats) {
  const configuration = { name: 'Stats' };

  try {
    validate(schema, stats, configuration);
    return { result: true };
  } catch (e) {
    return { result: false, message: e.message };
  }
}
