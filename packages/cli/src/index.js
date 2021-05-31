/* eslint-env node */

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const serveCommand = require('./commands/serve');
const generateCommand = require('./commands/generate');
const validateCommand = require('./commands/validate');

[
  (yargs) => yargs(hideBin(process.argv)),
  serveCommand,
  generateCommand,
  validateCommand,
  (yargs) => yargs.strictCommands().demandCommand(1),
  (yargs) => yargs.argv,
].reduce((all, current) => current(all), yargs);
