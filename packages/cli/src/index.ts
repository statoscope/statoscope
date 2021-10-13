/* eslint-env node */

import yargs from 'yargs/yargs';
import { Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import serveCommand from './commands/serve';
import generateCommand from './commands/generate';
import validateCommand from './commands/validate';
import queryCommand from './commands/query';
import injectReport from './commands/injectReport';

const commands: Array<(yargs: Argv) => Argv> = [
  serveCommand,
  generateCommand,
  validateCommand,
  queryCommand,
  injectReport,
  (yargs): Argv => yargs.strictCommands().demandCommand(1),
];

commands.reduce<Argv>((all, current) => current(all), yargs(hideBin(process.argv))).argv;
