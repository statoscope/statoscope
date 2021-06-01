/* eslint-env node */

import yargs from 'yargs/yargs';
import { Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import serveCommand from './commands/serve';
import generateCommand from './commands/generate';
import validateCommand from './commands/validate';

const commands: Array<(yargs: Argv) => Argv> = [
  serveCommand,
  generateCommand,
  validateCommand,
  (yargs) => yargs.strictCommands().demandCommand(1),
];

commands.reduce<Argv>((all, current) => current(all), yargs(hideBin(process.argv))).argv;
