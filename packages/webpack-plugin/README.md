# Statoscope webpack-plugin

[![npm version](https://badge.fury.io/js/%40statoscope%2Fwebpack-plugin.svg)](https://badge.fury.io/js/%40statoscope%2Fwebpack-plugin)
[![Support](https://img.shields.io/badge/-Support-blue)](https://opencollective.com/statoscope)

This webpack-plugin generates statoscope HTML-report from webpack-stats.

## Installation

```sh
npm install @statoscope/webpack-plugin --save-dev
```

## Usage

**webpack.config.js:**

```js
const StatoscopeWebpackPlugin = require('@statoscope/webpack-plugin').default;

config.plugins.push(new StatoscopeWebpackPlugin());
```

There are some options:

```js
new StatoscopeWebpackPlugin({
  saveReportTo: 'path/to/report-[name]-[hash].html',
  saveStatsTo: 'path/to/stats-[name]-[hash].json',
  saveOnlyStats: false,
  statsOptions: {
    /* any webpack stats options */
  },
  additionalStats: ['path/to/any/stats.json'],
  watchMode: false,
  name: 'some-name',
  open: 'file',
  compressor: 'gzip',
  reports: [/* ... */],
  extensions: [/* ... */],
});
```

#### options.saveReportTo: string

Path to an HTML with a report.

By default is a temporary directory with filename: `statoscope-[name]-[hash].html`

`[name]` replacing by `options.name` (if specified) or `compilation.name` (if specified) or `unnamed`

`[hash]` replacing by `compilation.hash`

#### options.saveStatsTo: string

A path for saving the stats: `stats-[name]-[hash].json`

`[name]` replacing by `options.name` (if specified) or `compilation.name` (if specified) or `unnamed`

`[hash]` replacing by `compilation.hash`

By default don't save anything

#### options.saveOnlyStats: boolean

If `true` then only json with the stats will be generated. HTML report will be omitted.

`false` by default.

#### options.statsOptions: [StatsOptions](https://webpack.js.org/configuration/stats/#stats-options)

With `statsOptions` you can override your webpack-config `stats` option

For example: `statsOptions: { all: true, source: false }`

If not specified (by default) then `stats` options from your webpack config will be used.

> All stats-options see at [docs](https://webpack.js.org/configuration/stats/#stats-options)

#### options.additionalStats: string[]

List with the paths to webpack stats that will be loaded into Statoscope along with current compilation stats.

In UI, you may switch between them or diff.

```js
const glob = require('glob');

new StatoscopeWebpackPlugin({
  saveStatsTo: 'path/to/stats/stats-[name]-[hash].json',
  additionalStats: glob.sync('path/to/stats/*.json'),
});
```

In this example, the stats from every compilation will be saved into `path/to/stats/` directory.

Also, all JSON files from `path/to/stats/` directory will be added to the Statoscope report.

In this way, you can collect the stats from all compilations and diff these to find out how your bundle was changing in time.

#### options.watchMode: boolean

By default, Statoscode does not generate a report if the webpack runs in watch-mode.

Set `watchMode: true` to generate a report in watch-mode

#### options.name: string

Custom compilation name.

By default `compilation.name` (if specified)

#### options.open: enum

Open report after compilation.

- `false` - don't open report
- `file` - open html with report
- `dir` - open a directory with html file

`dir` by default.

#### options.compressor: enum

Collect compressed (e.g. gzip) size of the resources (assets and modules).

- `'gzip'` (default) - compress all the resources with gzip and collect the compressed sizes
- `['gzip', ZlibOptions]` - the same as above but with custom [zlib settings](https://nodejs.org/api/zlib.html#zlib_class_options)
  ```ts
  new Statoscope({
      compressor: ['gzip', {level: 9}]
  })
  ```
- `CompressFunction` - a function that takes source as an input and should return compressed size for this resource (useful if you want to use non-gzip compressor)
- `false` - don't collect compressed sizes

##### Example with a custom compressor

```ts
new Statoscope({
  compressor(source: Buffer | string, filename: string) {
    const compressed = customCompressor(source);
    return {
      compressor: 'my-custom-compressor',
      size: compressed.length
    }
  }
})
```

### options.reports: `Report[]`

List of custom reports that will be passed into the UI.

See report format in [stats-extension-custom-reports readme](/packages/stats-extension-custom-reports/README.md).

**Example:**

```js
new Statoscope({
  reports: [
    {
      id: 'top-20-biggest-modules',
      name: 'Top 20 biggest modules',
      data: { some: { custom: 'data' } }, // or () => fetchAsyncData()
      view: [
        'struct',
        {
          data: `#.stats.compilations.(
            $compilation: $;
            modules.({
              module: $,
              hash: $compilation.hash,
              size: getModuleSize($compilation.hash)
            })
          ).sort(size.size desc)[:20]`,
          view: 'list',
          item: 'module-item',
        },
      ],
    },
  ],
});
```

### options.extensions: `StatsExtensionWebpackAdapter<TPayload>[]`

List of stats extension webpack adapters.

This options helps you to pass your own webpack stats extensions.

For example, lets implement simple extension that gets webpack compiler context directory.

**webpack-context-extension.ts:**

```ts
import { Extension } from '@statoscope/stats/spec/extension';

type Payload = {
  context: string
};

type ContextExtension = Extension<Payload>;

export default class WebpackContextExtension implements StatsExtensionWebpackAdapter<Payload> {
  context: string = '';

  handleCompiler(compiler: Compiler): void {
    this.context = compiler.context;
  }

  getExtension(): ContextExtension {
    return {
      descriptor: {name: 'webpack-context-extension', version: '1.0.0'},
      payload: {context: this.context}
    }
  }
}
```

**webpack.config.js:**

```js
const WebpackContextExtension = require('./webpack-context-extension');
const StatoscopeWebpackPlugin = require('@statoscope/webpack-plugin').default;

config.plugins.push(new StatoscopeWebpackPlugin({
  extensions: new WebpackContextExtension()
}));
```

Now you can handle your extension payload with jora:

```
$ext: 'webpack-context-extension'.resolveExtension(@.name.pick()).data;
$webpackContext: $ext.payload.context;
```

> `resolveExtension`-helper resolves an extension by its name and a filename that extension attached to

## FAQ

### Which stats-flags Statoscope use?

Statoscope use only stats that it has. There is only one required flag - `hash`.

```jsonc
stats: {
  all: false, // disable all the stats
  hash: true, // add a compilation hash
}
```

It works, but useless, because the result stats is empty.

You may disable some stats-flags to decrease your stats-file size.
Here is a set of minimum useful stats flags:

```jsonc
stats: {
  all: false, // disable all the stats
  hash: true, // add compilation hash
  entrypoints: true, // add entrypoints stats
  chunks: true, // add chunks stats
  chunkModules: true, // add modules stats
  reasons: true, // add modules reasons stats
},
```

And an example of full stats:

```jsonc
stats: {
  all: false, // disable all the stats
  hash: true, // add compilation hash
  entrypoints: true, // add entrypoints stats
  chunks: true, // add chunks stats
  chunkModules: true, // add modules stats
  reasons: true, // add modules reasons stats

  assets: true, // add assets stats
  chunkOrigins: true, // add chunks origins stats (to find out which modules require a chunk)
  version: true, // add webpack version
  builtAt: true, // add build at time
  timings: true, // add timing information
  performance: true, // add info about oversized assets
  source: true, // add module sources (uses to find modules duplicates)
},
```

### Statoscope shows an absolute path to the modules

Just specify a context to stats options:

```jsonc
stats: {
  context: 'path/to/project/root'
}
```

## Support

If you are an engineer or a company that is interested in Statoscope improvements, you may support Statoscope by financial contribution at [OpenCollective](https://opencollective.com/statoscope).
