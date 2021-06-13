const fs = require('fs');
const path = require('path');

const versionPath = path.resolve(__dirname, '../src/version.ts');
const packageJSON = require('../package.json');
fs.writeFileSync(
  versionPath,
  `export const name = ${JSON.stringify(packageJSON.name)};
export const version = ${JSON.stringify(packageJSON.version)};
`
);
