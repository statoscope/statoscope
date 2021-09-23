import * as path from 'path';
import { Config } from '@statoscope/types/types/config';

export type RequiredConfig = {
  path: string;
  config: Config;
};

export function requireConfig(filename = 'statoscope.config.js'): RequiredConfig {
  const configPath = path.resolve(filename);
  let config: Config;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    config = require(configPath) as Config;
  } catch (e) {
    console.log('[WARN]: No Statoscope-config found');
    config = {};
  }

  return {
    path: configPath,
    config,
  };
}
