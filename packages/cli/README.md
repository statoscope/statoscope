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

## Features

### validate (experimental)

Validate one or more webpack stats.

> This is an experimental feature. Please provide some feedback

`validate validator input [...args]`

- `--validator` (`-v`) - path to validator-script (see validator API below)
- `--input` (`-i`) - path to one or more webpack stats
- `--warn-as-error` (`-w`) - treat warnings as errors

#### Validator API

**As jora-query:**

Validator-script may provide plain [jora-query](https://github.com/discoveryjs/jora).

A query must return `TestEntry[]`:

```ts
type TestEntry = {
  type?: 'error' | 'warn' | 'info'; // 'error' by default
  assert?: boolean; // false by default
  messsage: string;
  filename?: string;
};
```

**Example:**

`rules.jora:`

```
[
  {
    assert: compilations.nodeModules.[name="lodash"].size() = 0,
    message: 'Lodash usage detected. Please do not use lodash in this project',
    filename: name
  }
]
```

```sh
statoscope validate rules.jora stats.json
```

`Output:`

```
stats.json
  error: Lodash usage detected. Please do not use lodash in this project

Errors: 1
```

In this example validation will fail if bundle uses `lodash` library.

> You can inspect stats-file structure and test your rules at [statoscope-sandbox](https://statoscope.tech) by clicking to `Make report` button.

You may also validate multiple stats (e.g. in CI):

`rules.jora:`

```
$master: .[name="master.json"];
$branch: .[name="branch.json"];

$branchRXJS: $branch.compilations.nodeModules.[name="rxjs"].instances.reasons.data.resolvedModule;
$masterRXJS: $master.compilations.nodeModules.[name="rxjs"].instances.reasons.data.resolvedModule;

[
  {
    assert: $branch.compilations.nodeModules.[name="lodash"].size() = 0,
    message: 'Lodash usage detected. Please do not use lodash in this project',
    filename: $branch.name
  },
  {
    type: 'warn',
    assert: $branchRXJS.size() <= $masterRXJS.size(),
    message: 'More rxjs usage detected. Try not to increase rxjs-usage',
    filename: $branch.name
  }
]
```

```sh
statoscope validate rules.jora --input master.json --input branch.json
```

`Output:`

```
branch.json
  error: Lodash usage detected. Please do not use lodash in this project
  warn: More rxjs usage detected. Try not to increase rxjs-usage

Errors: 1
Warnings: 1
```

Also, there
are [a lot of jora-helpers](https://github.com/statoscope/statoscope/blob/master/packages/webpack-model/src/jora-helpers.js)
. For example:

`rules.jora:`

```
$master: .[name="astexp-1.json"];
$branch: .[name="astexp-2.json"];

$masterInitialSize: $master.compilations.chunks.[initial].reduce(=> size + $$, 0);
$branchInitialSize: $branch.compilations.chunks.[initial].reduce(=> size + $$, 0);
$initialSizeDiff: $branchInitialSize - $masterInitialSize;
$initialSizeDiffPercent: $branchInitialSize.percentFrom($masterInitialSize, 2);

[
  {
    assert: $initialSizeDiff <= 0,
    message: `Initial assets size increased by ${$initialSizeDiff.formatSize()} (${$initialSizeDiffPercent}%)`,
    filename: $branch.name
  }
]

```

```sh
statoscope validate rules.jora --input master.json --input branch.json
```

`Output:`

```
branch.json
  error: Initial assets size increased at 249.57 kb (9.16%)"

Errors: 1
```

**As function:**

Validator-script may export `ValidatorFn` that will be called to validate stats from `input`.

```ts
type Data = {
  files: Object[];
  compilations: Object[];
  query: (query: string, data?: any) => any; // query-parameter is jora-syntax query
};

type API = {
  error(message: string, filename?: string): void;
  warn(message: string, filename?: string): void;
  info(message: string, filename?: string): void;
};
type ValidatorFn = (data: Data, api: API) => Promise<string | void>;
```

**Example:**

```js
module.exports = (data, api) => {
  const lodash = data.query('compilations.nodeModules.[name="lodash"]');

  if (lodash.length) {
    api.error(
      'Lodash usage detected. Please do not use lodash in this project',
      data.files[0].name
    );
  }
};
```

```sh
statoscope validate rules.js stats.json
```

`Output:`

```
stats.json
  error: Lodash usage detected. Please do not use lodash in this project

Errors: 1
```

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
