# Statoscope CLI

[![npm version](https://badge.fury.io/js/%40statoscope%2Fcli.svg)](https://badge.fury.io/js/%40statoscope%2Fcli)
[![Support](https://img.shields.io/badge/-Support-blue)](https://opencollective.com/statoscope)

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

This command uses [stats-validator](/packages/stats-validator). Please look at this package for more info

**Example:**

1. Install webpack-plugin for the validator:
`npm install --save-dev @statoscope/stats-validator-plugin-webpack`

2. Create a statosope-config:

**statoscope.config.js**
```js
module.exports = {
  validate: {
    // add webpack plugin with rules
    plugins: ['@statoscope/webpack'],
    reporters: [
      // console-reporter to output results into cinsole (enabled by default)
      '@statoscope/console',
      // reporter that henerates UI-report with validation-results
      ['@statosope/stats-report', {open: true}],
    ],
    rules: {
      // ensures that build-time of your bundle hasn't exceeded 10 sec
      '@statoscope/webpack/build-time-limits': ['error', {global: 10000}],
      // any other rules
    }
  }
}
```

3. Exec the command:

```sh
statoscope validate --input path/to/stats.json
```

4. Analyze results in the console or generated UI-report

### serve

Start HTTP-server and serve JSON-stats as HTML report

`serve input [...args]`

- `--input` (`-i`) - path to one or more webpack stats
- `--host` (`-h`) - server host
- `--port` (`-p`) - server port
- `--open` (`-o`) - open browser after server start

**Example:**

```sh
statoscope serve path/to/stats.json -o
```

Start server and open browser.

### generate

Generate HTML report from JSON-stats.

`generate input output [...args]`

- `--input` (`-i`) - path to one or more webpack stats
- `--output` (`-t`) - path to generated HTML
- `--open` (`-o`) - open browser after generate

**Example:**

```sh
statoscope generate path/to/stats.json path/to/report.html -o
```

Create statoscope report, save it to `path/to/report.html` and open

## Support

If you are an engineer or a company that is interested in Statoscope improvements, you may support Statoscope by
financial contribution at [OpenCollective](https://opencollective.com/statoscope).
