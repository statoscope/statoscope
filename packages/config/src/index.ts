import * as fs from 'fs';
import * as path from 'path';
import { Config } from '@statoscope/types/types/config';

export type RequiredConfig = {
  path: string;
  config: Config;
};

export function requireConfig(filename = 'statoscope.config.js'): RequiredConfig {
  const configPath = path.resolve(filename);

  if (!fs.existsSync(configPath)) {
    return {
      path: configPath,
      config: {},
    };
  }

  return {
    path: configPath,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    config: require(configPath) as Config,
  };
}
