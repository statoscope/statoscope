/* eslint-env node */

const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const packageJSON = require(path.resolve('./package.json'));
yargs(hideBin(process.argv)).command(
  '$0',
  '',
  (yargs) => {
    return yargs
      .option('field', {
        array: true,
      })
      .positional('output', {
        default: './src/version.ts',
      });
  },
  (argv) => {
    const versionPath = path.resolve(argv.output || './src/version.ts');
    const fields = ['name', 'version', 'description', ...(argv.field || [])];

    const content = [];

    for (const field of fields) {
      content.push(`export const ${field} = ${JSON.stringify(packageJSON[field])};`);
    }

    fs.writeFileSync(versionPath, content.join('\n'));
    console.log(`Version file ${versionPath} was created`);
  }
).argv;
