# Config

[![npm version](https://badge.fury.io/js/%40statoscope%2Fconfig.svg)](https://badge.fury.io/js/%40statoscope%2Fconfig)
[![Financial Contributors on Open Collective](https://opencollective.com/statoscope/all/badge.svg?label=financial+contributors)](https://opencollective.com/statoscope)

Statoscope Config Helpers

## Config format

```ts
export type Config = {
  silent?: boolean;
  validate?: {
    plugins?: Array<string | [string, string]>;
    warnAsError?: boolean;
    reporters?: ReporterConfig[];
    rules: Record<string, RuleDesc<unknown>>;
  };
};
```

### `silent`

For now, it just suppresses stats-validators reporters

### `validator`

See [stats-validator readme](/packages/stats-validator/README.md#config)

**Example:**

```js
module.exports = {
  validate: {
    plugins: ['@statoscope/webpack'],
    rules: {
      '@statoscope/webpack/restricted-modules': ['error', [/\/src\//]],
      '@statoscope/webpack/restricted-packages': ['error', ['foo']],
    },
  },
};
```
