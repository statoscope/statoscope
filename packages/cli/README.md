# Statoscope CLI

[![npm version](https://badge.fury.io/js/%40statoscope%2Fcli.svg)](https://badge.fury.io/js/%40statoscope%2Fcli)
[![Financial Contributors on Open Collective](https://opencollective.com/statoscope/all/badge.svg?label=financial+contributors)](https://opencollective.com/statoscope)

This package supplies Statoscope as CLI tool

## Installation

```sh
npm i @statoscope/cli -g
```

## Usage

```sh
statoscope [command] [...args]
```

## Commands

### validate

Validate or compare webpack stats.

`validate [...args]`

- `--input` (`-i`) - path to a stats.json
- `--reference` (`-r`) - path to a stats-file to compare with (optional)
- `--config` (`-c`) - path to statoscope config (by default `{pwd}/statoscope.config.js` has used)
- `--warn-as-error` (`-w`) - treat warnings as errors

**Example:**

1. Install webpack-plugin for the validator:

`npm install --save-dev @statoscope/stats-validator-plugin-webpack @statoscope/stats-validator-reporter-console @statoscope/stats-validator-reporter-stats-report`


2. Create a statosope-config:

**statoscope.config.js**
```js
module.exports = {
  validate: {
    // add webpack plugin with rules
    plugins: ['@statoscope/webpack'],
    reporters: [
      // console-reporter to output results into console (enabled by default)
      '@statoscope/console',
      // reporter that generates UI-report with validation-results
      ['@statoscope/stats-report', {open: true}],
    ],
    // rules to validate your stats (use all of them or only specific rules)
    rules: {      
      // ensures that the build time has not exceeded the limit (10 sec)
      '@statoscope/webpack/build-time-limits': ['error', 10000],
      // ensures that bundle doesn't use specified packages
      '@statoscope/webpack/restricted-packages': ['error', ['lodash', 'browserify-crypto']],
      // ensures that bundle hasn't package duplicates
      '@statoscope/webpack/no-packages-dups': ['error'],
      // ensure that the download time of entrypoints is not over the limit (3 sec)
      '@statoscope/webpack/entry-download-time-limits': ['error', { global: { maxDownloadTime: 3000 } }],
      // ensure that the download size of entrypoints is not over the limit (3 mb)
      '@statoscope/webpack/entry-download-size-limits': ['error', { global: { maxSize: 3 * 1024 * 1024 } }],
      // diff download size of entrypoints between input and reference stats. Fails if size diff is over the limit (3 kb)
      '@statoscope/webpack/diff-entry-download-size-limits': [
        'error',
        { global: { maxSizeDiff: 3*1024 } },
      ],
      // compares usage of specified packages usage between input and reference stats. Fails if rxjs usage has increased
      '@statoscope/webpack/diff-deprecated-packages': ['error', ['rxjs']],
    }
  }
}
```

3. Exec the command:

```sh
statoscope validate --input path/to/stats.json
```

4. Analyze results in the console or generated UI-report

> Learn more on [@statoscope/stats-validator](/packages/stats-validator) and [@statoscope/stats-validator-plugin-webpack](/packages/stats-validator-plugin-webpack)

### init

Create example statoscope.config.js.

`init [...args]`

- `--output` (`-o`) - config file path (`./statoscope.config.js` by default)

**Example:**

```sh
statoscope init
```

Creates `statoscope.config.js` in a current directory

```sh
statoscope init -o some/path/server.statoscope.config.js
```

Creates `server.statoscope.config.js` in `some/path/`

### create

Generate custom validator plugin/rule/reporter

`create [...args]`

- `--output` (`-o`) - config file path (`./statoscope.config.js` by default)

- `--entity` (`-e`) - Entity to generate (`plugin`, `rule` or `reporter`)

- `--output` (`-o`) - Path to generated code (`./` by default)

- `--type` (`-t`) - Output type (`js` (default) or `ts`)

- `--module` (`-m`) - Output modules type (`commonjs` (default) or `esm`)

**Example:**

```sh
statoscope create rule -t ts -o ./my-custom-statoscope-rules
```

Creates custom rule for stats validator in `my-custom-statoscope-rules` directory

### serve

Start HTTP-server and serve JSON-stats as HTML report

`serve input [...args]`

- `--input` (`-i`) - path to one or more webpack stats
- `--reference` (`-r`) - path to a stats-file to compare with (optional).
  When used, only first file from `input` will be used
- `--host` (`-h`) - server host
- `--port` (`-p`) - server port
- `--open` (`-o`) - open browser after server start
- `--custom-report` - path to [custom report(s)](/packages/stats-extension-custom-reports/README.md)
  to be included into generated HTML report
- `--config` (`-c`) - path to the statoscope config file with custom user reports

**Example:**

```sh
statoscope serve path/to/stats.json -o
```

Start server and open browser.

### generate

Generate HTML report from JSON-stats.

`generate input output [...args]`

- `--input` (`-i`) - path to one or more webpack stats
- `--reference` (`-r`) - path to a stats-file to compare with (optional). When used, only first file from `input` will be used
- `--output` (`-t`) - path to generated HTML
- `--open` (`-o`) - open browser after generate
- `--custom-report` - path to [custom report(s)](/packages/stats-extension-custom-reports/README.md)
  to be included into generated HTML report
- `--config` (`-c`) - path to the statoscope config file with custom user reports

**Example:**

```sh
statoscope generate path/to/stats.json path/to/report.html -o
```

Create statoscope report, save it to `path/to/report.html` and open

### query

Executes [jora](https://github.com/discoveryjs/jora)-query on stats-file.

`query [...args]`

- `--input` (`-i`) - path to one or more webpack stats
- `--query` (`-q`) - jora-query

> Also, jora-query could be passed through stdin

**Example:**

```sh
statoscope query --input path/to/stats.json --query 'compilations.modules.size()' > output.txt

# or

echo 'compilations.modules.size()' | statoscope query --input path/to/stats.json > output.txt
```

### inject-report

Inject specified [custom reports]((/packages/stats-extension-custom-reports/README.md)) into stats.

`inject-report [...args]`

- `--input` (`-i`) - path to the webpack stats file
- `--report` (`-r`) - path to one or more json with reports

> Report could be passed as a single report or an array with reports

> Raw JSON could be passed through stdin

**Example:**

**my-reports.json:**

```json
[
  {
    "id": "foo",
    "data": [1, 2, 3],
    "view": ["struct"]
  },
  {
    "id": "bar",
    "data": [4, 5, 6],
    "view": ["list"]
  }
]
```

```sh
statoscope inject-report --input path/to/stats.json --report path/to/my-reports.json > output.json

# or

cat path/to/my-reports.json | statoscope inject-report --input path/to/stats.json > output.json
```

## Support

If you are an engineer or a company that is interested in Statoscope improvements, you could support Statoscope by
financial contribution at [OpenCollective](https://opencollective.com/statoscope).
