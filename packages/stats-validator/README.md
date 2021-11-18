# Statoscope Stats Validator

[![npm version](https://badge.fury.io/js/%40statoscope%2Fstats-validator.svg)](https://badge.fury.io/js/%40statoscope%2Fstats-validator)
[![Financial Contributors on Open Collective](https://opencollective.com/statoscope/all/badge.svg?label=financial+contributors)](https://opencollective.com/statoscope)

This package contains a toolkit to validate stats.

## API

### `new Validator(config: Config, rootDir?: string)`

Create the Validator instance with config (see below), relative `rootDir`-directory (current working directory by default)

### `validate(input: string, reference?: string): Promise<Result>`

Apply rules to `input` and `reference` (if specified) files.

`input`-file is a current stats (e.g. stats of current branch).

`reference`-file is a stats to compare with (e.g. stats of master branch).

Returns validation results (see below).

## Config

```ts
type Config = {
  plugins?: Array<string | [string, string]>;
  rules: Record<string, RuleDesc<unknown>>;
  reporters?: ReporterConfig[];
  warnAsError?: boolean;
};
```

### plugins

List of plugins (see more about plugins API below).

The main goal of a plugin is providing some rules for validation.

There is a [plugin](/packages/stats-validator-plugin-webpack/) to validate webpack stats (need to be installed)

`npm install --save-dev @statoscope/stats-validator-plugin-webpack`

**statoscope.config.js:**

```js
module.export = {
  validate: {
    plugins: ['@statoscope/webpack'],
    rules: {
      '@statoscope/webpack/no-modules-deopts': ["error"]
    }
  }
};
```

#### Plugin path resolution

There are a few ways to how you can specify a plugin name:

- full package name
- short package name (please see example below)
- relative or absolute path

Here are the examples with all possible ways:

**statoscope.config.js:**

```js
module.export = {
  validate: {
    plugins: [
      'statoscope-stats-validator-plugin-foo', // full package name
      '@statoscope/webpack', // short package name, resolves to @statoscope/stats-validator-plugin-webpack
      '@foo/my-validator', // short package name, resolves to @foo/statoscope-stats-validator-plugin-my-validator
      'webpack', // short package name, resolves to statoscope-stats-validator-plugin-webpack
      ['./my/plugin.js', 'my-plugin'], // relative path (relative config path)
      [require.resolve('./my/another/plugin.js'), 'my-another-plugin'] // absolute path
    ],
    rules: {
      'statoscope-stats-validator-plugin-foo/some-rule': ['error'],
      '@statoscope/webpack/no-modules-deopts': ['error'],
      'foo/some-rule': ['error'],
      'my-plugin/some-rule': ['error'],
      'my-another-plugin/some-rule': ['error'],
    }
  }
};
```

To use short package name, its name must have `statoscope-stats-validator-plugin-`-prefix or `@statoscope/stats-validator-plugin-`-prefix.

Note that relative or absolute path should be specified with an alias

### rules

List of rules (see more about rules API below).

Rule validates some part of a bundle.

Every item of the list contains: rule name, execution mode and rule options (optional).

Execution modes:

- `error` - rules messages have treated as an error
- `warn` - rules messages have treated as a warning
- `off` - rules messages have ignored

**statoscope.config.js:**

```js
module.export = {
  validate: {
    plugins: [
      '@statoscope/webpack',
    ],
    rules: {
      '@statoscope/webpack/restricted-packages': ['error', ['lodash']],
    }
  }
};
```

### reporters

List of reporters (see more about reporters API below).

Reporter handles validation results.

There are two builtin reporters:

- [console](/packages/stats-validator-reporter-console/)
- [stats-report](/packages/stats-validator-reporter-stats-report/)

**statoscope.config.js:**

```js
module.export = {
  validate: {
    plugins: [
      '@statoscope/webpack',
    ],
    reporters: [
      'statoscope-stats-validator-reporter-foo', // full package name
      '@statoscope/stats-report', // short package name, resolves to @statoscope/stats-validator-reporter-stats-report
      'stats-report', // short package name, resolves to @statoscope/stats-validator-reporter-stats-report or statoscope-stats-validator-reporter-stats-report
      ['./my/plugin.js', 'my-report'], // relative path (relative config path)
      [require.resolve('./my/another/report.js'), 'my-another-report'] // absolute path
    ],
    rules: {
      '@statoscope/webpack/restricted-packages': ['error', ['lodash']],
    }
  }
};
```

To use short package name, its name must have `statoscope-stats-validator-reporter-`-prefix or `@statoscope/stats-validator-reporter-`-prefix.

`ConsoleReporter` has used by default.

### warnAsError

Treat warn-messages from rules as errors.

## Plugins API

Plugin is a function that must return a plugin descriptor:

```js
const myPlugin = () => {
  return {
    prepare(files) {
      return doSomethingWithFiles(files);
    },
    rules: {
      foo: fooRule,
      bar: barRule,
    }
  };
};
```

### prepare

`prepare`-function of every plugin will be called for `input` and `reference` files.

### rules

List of rules that plugin provides.

## Rules API

Rule is a function that validates some part of bundle:

```js
const myRule = (params, data, api) => {
  if (!isOK(data)) {
    api.message('Something is wrong');
  }
}
```

- `params` - options from config (e.g. `'my-plugin/my-rule': ['error', { foo: 'bar'}]`)
- `data` - input and reference files content
- `api` - rule API instance

### api.message(text: string, options?: APIFnOptions): void

Add validation message from the rule.

#### options.filename?: string

File name that the message has associated with

#### options.compilation?: string

Compilation id that the message has associated with

#### options.related?: RelatedItem[]

Entities that the message has associated with

```js
api.message(
  'Something is wrong with module ./foo.js',
  {
    related: [
      { type: 'module', id: './foo.js' }
    ]
  }
);
```

There are several types of related items:

- `module`
- `package`
- `package-instance`
- `resource`
- `entry`
- `compilation`

#### options.details?: Details

Details for reporters

There are several types of details:

**text**

Used by text-reporters

```js
api.message(
  'Something is wrong with module ./foo.js',
  {
    details: [
      { 
        type: 'text',
        content: [
          'Here are the module reasons:',
          ...module.resons.map(r => r.name)
        ]
      }
    ]
  }
);
```

```
❌ Something is wrong with module ./foo.js
  Here are the module reasons:
  ./bar.js
  ./baz.js
```

> `content` might be `string | string[] | (() => string | string[])`

**tty**

Used by TTY-reporters (e.g. [ConsoleReporter](/packages/stats-validator-reporter-console/src/index.ts))

```js
import chalk from 'chalk';

api.message(
  'Something is wrong with module ./foo.js',
  {
    details: [
      { 
        type: 'tty',
        content: [
          chalk.cyan('Here are the module reasons:'),
          ...module.resons.map(r => chalk.yellow(r.name))
        ]
      }
    ]
  }
);
```

> `content` might be `string | string[] | (() => string | string[])`

**discovery**

Used by discovery-reporters (e.g. [StatsReportReporter](/packages/stats-validator-reporter-stats-report/src/index.ts))

The main idea around this type of details is passing some data to stats report viewer (based on [DiscoveryJS](https://github.com/discoveryjs/discovery)).

It helps to discover validation message with flexible UI.

```js
api.message(`Module ${module.name} should not be used`, {
  details: [
    {
      type: 'discovery',
      query: `
      $input: resolveInputFile();
      { module: #.module.resolveModule(#.compilation) }
      `,
      payload: {
        context: {
          compilation: compilation.hash,
          module: module.name,
        },
      },
      view: {
        view: 'module-item',
        data: `{ module }`
      }
    },
  ],
});
```

See examples at [Stats Validator Webpack Plugin](/packages/stats-validator-plugin-webpack/src/rules/)

### api.getStorage(): Storage

Get list of validation messages (results) that was emitted by the rule.

```js
const items = api.getStorage();

for (const item of items) {
  console.log(item.message);
}
```

Every storage item has the following format:

```ts
type Item = {
  message: string; // item message
  filename?: string; // file name that the message has associated with
  compilation?: string; // compilation id that the message has associated with
  details?: Details; // rule's details (see api.message method for more info)
  related?: RelatedItem[]; // rule's related entities (see api.message method for more info)
};
```

### api.setRuleDescriptor(descriptor: RuleDescriptor): void

Set rule meta-data.

```js
api.setRuleDescriptor({
  description: `My pretty cool rule`,
  package: {
    name: 'my-package-with-validator-plugin',
    version: '7.7.7',
  },
});
```

### api.getRuleDescriptor(): RuleDescriptor | null

Get rule meta-data

## Reporters API

Reporter is a class with `run` method:

```ts
interface Reporter {
  run(result: Result): Promise<void>;
}
```

**Example:**

```js
class MyConsoleReporter {
  run(result) {
    for (const rule of result.rules) {
      const ruleDescriptor = rule.api.getRuleDescriptor();
      console.log(`Rule name: ${rule.name}`);
      console.log(`Rule description: ${ruleDescriptor.description}`);

      const items = rule.api.getStorage();

      for (const item of items) {
        console.log(item.message);

        for (const detail of item.details) {
          if (detail.type === 'tty') {
            console.log(detail.content);
          }
        }
      }
    }
  }
}
```

## Custom Plugin Example

Create custom plugin script:

__my-custom-stats-validator-plugin.js:__

```js
module.exports = () => {
  return {
    rules: {
      'my-rule': (ruleParams, data, api) => {
        const result = data.query('some jora query', data.files, {ruleParams});

        if(result.notOk) {
          api.message(':(')
        }
      }
    }
  }
}
```

Add this plugin to statoscope config:

__statoscope.config.js:__

```js
module.exports = {
  validate: {
    plugins: ['@statoscope/webpack', ['./my-custom-stats-validator-plugin.js', 'my-plugin']],
    rules: {
      '@statoscope/webpack/restricted-packages': ['error', ['foo']],
      'my-plugin/my-rule': ['error', 'rule params'],
    },
  }
}
```

> For more rule examples, please see [existing rule sources](/packages/stats-validator-plugin-webpack/src/rules)
