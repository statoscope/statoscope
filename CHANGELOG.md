# Changelog

## 5.5.0 (08 July 2021)

## Features

- `[webpack-plugin]` add new property `saveOnlyStats`
- `[webpack-plugin]` add new property `saveReportTo` (as a replacement for `saveTo`)

## Refactor

- `[webpack-plugin]` refactoring to make code more flexible
- `[report-writer]` refactor work with the streams

## 5.4.3 (06 July 2021)

### Fixes

- `[webpack-ui]` handle unresolved module reasons for a package
- `[webpack-stats-extension-package-info]` match package version for webpack 4

## 5.4.2 (05 July 2021)

## Fixes
- `[webpack-plugin]` sometimes a report was opening before it written to the disk
- `[webpack-stats-extension-compressed]` fix fails on reexport usage on webpack 4
- `[webpack-stats-extension-package-info]` taking into account that webpack 4 uses absolute path for some module names

## 5.4.1 (03 July 2021)

### Fixes

- `[webpack-model]` stats extensions now works for child compilations

## 5.4.0 (03 July 2021)

### Features

- `[ui-webpack]` use as an alias to webpack-ui and webpack-plugin
- `[webpack-plugin]` create directory before write the stats and report
- `[webpack-ui]` add package version-diff
  Adds the badges like: `major upgrade from x.x.x`
- `[helpers]` add `semverGT`-helper
- `[helpers]` add `semverGTE`-helper
- `[helpers]` add `semverLT`-helper
- `[helpers]` add `semverLTE`-helper
- `[helpers]` add `semverEQ`-helper
- `[helpers]` add `semverDiff`-helper
- `[helpers]` add `semverParse`-helper
- `[webpack-model]` add `context`-param to jora query-method (#82)
- `[cli]` add `context`-param to jora query-method (#82)

### Fixes

- `[webpack-stats-extension-compressed]` fix CssModule handling
- `[webpack-stats-extension-compressed]` fix temporary assets handling

### Refactor

- `[helpers]` move `formatDiff`-helper from `webpack-ui`

## 5.3.2 (30 June 2021)

### Fixes

- `[report-writer]` return `options.scripts` as `Array<stirng, Item>`

## 5.3.1 (30 June 2021)

### Fixes

- fix all @statoscope-deps version for not to old versions

## 5.3.0 (30 June 2021)

### Features

- `[webpack-plugin]` collect compressed (e.g. gzip) size of the resources (assets and modules)

  There is a new `compressor` - option that can be `false | 'gzip' | ['gzip', ZlibOptions] | CompressFunction`:

  - `'gzip'` (default) - compress all the resources with gzip (compression level - 6) and collect the compressed sizes

  - `['gzip', ZlibOptions]` - the same as `gzip` but with custom [zlib settings](https://nodejs.org/api/zlib.html#zlib_class_options)

  - `CompressFunction` - a function that takes source as an input and should return compressed size for this resource (useful if you want to use a non-gzip compressor)

  - `false` - don't collect compressed sizes

  > It uses `webpack-stats-extension-compressed` under the hood

- `[webpack-plugin]` collect packages versions

  > It uses `webpack-stats-extension-package-info` under the hood

- `[webpack-ui]` taking compressed (e.g. gzip) size of the resources into account

  There is a new setting to taking resources compressed size into account.

  If enabled then all the sizes will be shown as compressed.

  New jora-helpers:

  - `getModuleSize(module, hash)` return compressed or normal module size
  - `getAssetSize(asset, hash)` return compressed or normal asset size

  > It uses `stats-extension-compressed` under the hood and works only when the stats-file was taken from `webpack-plugin@>=5.3` or any source that uses `stats-extension-compressed`

- `[webpack-ui]` taking packages versions into account and output these in all the package items

  Also, added instance version into `compilations.nodeModules.instance`

  > It uses `stats-extension-package-info` under the hood and works only when the stats-file was taken from `webpack-plugin@>=5.3` or any source that uses `stats-extension-package-info`

- `[webpack-ui]` download time measure

  There are two new settings to select network speed and assets inject type. A download time for assets/chunks/entrypoints will be calculated based on specified network speed and assets inject type.

  There are two assets inject types:

  - `sync`: download time = `sum(downloadTime(assets))`
    Download time is a sum of the download time of all the assets

  - `async`: download time = `max(downloadTime(assets))`
    Download time is a download time of most heavy asset (usefull if `async`/`defer` used to inject your assets)

  The default network type is `3G Fast (1.37 MBit/s)` (like in Chromium).

  Assets inject type is `sync` by default.

- `[webpack-ui]` add `compact`-property to `asset/chunk/module/entry-item`-widget

  This property removes all the badges from the entity item

- `[webpack-ui]` add `Entrypoints` tab on `diff`-page

  Honestly, I just forgot to enable this tab a few releases ago 🙈

- `[stats-extension-compressed]` extension for collecting compressed resource sizes

  It allows compressing specified resource content (`string` or `Buffer`) with `gzip` or any other compressor.

  Also, it contains the API to generate and extract this info.

- `[webpack-stats-extension-compressed]` webpack adapter for `stats-extension-compressed`

  It allows collecting compressed resource sizes from webpack compilation

- `[stats-extension-package-info]` extension for collecting packages versions

  It allows compressing specified resource content (`string` or `Buffer`) with `gzip` or any other compressor.

  Also, it contains the API to generate and extract this info.

- `[webpack-stats-extension-package-info]` webpack adapter for `stats-extension-package-info`

  It allows collecting package versions from webpack compilation

- `[webpack-model]` added `resolveExtension(name)` jora-helper that returns extension API
- `[webpack-model]` support `stats-extension-package-info` extension

  There is a new jora-helpers:
  - `getPackageInstanceInfo(package, instancePath, hash)` that returns a package instance information

- `[webpack-model]` support `stats-extension-compressed` extension

  There are new jora-helpers:
  - `getModuleSize(module, compressed?, hash?)` returns compressed or normal module size
  - `getAssetSize(asset, compressed?, hash?)` returns compressed or normal asset size

- `[webpack-model]` added jora-helpers to getting network type and download speed:
  - `getNetworkTypeInfo(networkType: string)` return full info about specified network by its name (full list of type you can find at network-type-list.ts)
  - `getNetworkTypeName(networkType: Item)` return full name for specified network
  - `getDownloadTime(size: number, networkType: string)` calculate download time based on selected network type

- `[helpers]` add `locale`-parameter to `formatDate`-helper

- `[cli]` (validate): use `info`-type for messages by default

- `[stats]` a new package that contains Statoscope own stats format (extension-entity for now, but there are will be more entities)

- `[extensions]` a new package that contains Statoscope extensions toolkit

- `[report-writer]` add Piper - a proxy to ensure that all stream consumers have got a chunk

### Fixes

- `[webpack-model]` fix cases in normalization when no `compilation.modules`
- `[webpack-model]` fix normalization of `chunk.children`
- `[webpack-model]` fix `isRoot`-field for node-modules instances

  `isRoot` was falsy positive if the module name not starts from `.`

- `[webpack-plugin]` fix `saveStatsTo`

  Now it works

- `[webpack-ui]` fix packages instances list on `diff`-page

  There was `undefined` instead of instances links

- `[webpack-ui]` fix modules diff calculation

- `[cli]` (validate): use console.info for `info`-type messages

### Improvements

- `[webpack-ui]` better sorting of package instances

  Root-instances goes first

- `[webpack-ui]` fix loading-styles

### Refactor

- `[webpack-ui]` refactor diff-page to make it more flexible and extendable

## 5.2.0 (11 June 2021)

### Features

- `[webpack-ui]` show `asset module` badge for asset modules (#72)
- `[webpack-model]` use `chunk.name` in `chunkName`-helper
- `[webpack-plugin]` make `options`-parameter as optional

### Fixes

- `[webpack-plugin]` (crit) broken html report
- `[webpack-plugin]` (crit) fix taking `additionalStats` into account
- `[webpack-model]` make `context`-parameter in `Prepared.query` as optional (types)
- `[webpack-model]` make `stats`-parameter in `statName`-helper as optional (types)

## 5.1.0 (6 June 2021)

### Fixes

- `[webpack-ui]` fix popup positioning when page was scrolled

### Refactoring

- `[cli]` migrate to typescript
- `[webpack-plugin]` migrate to typescript
- `[webpack-ui]` migrate to typescript
- `[webpack-model]` migrate to typescript
- `[report-writer]` migrate to typescript
- `[helpers]` migrate to typescript

## 5.0.1 (1 June 2021)

### Fixes

- `[cli]` fix `generate` command
- `[cli]` fix readme
- `[webpack-plugin]` npm audit fix
- `[webpack-ui]` npm audit fix

## 5.0.0 (31 May 2021)

### Features

- `[ui-webpack]` **BREAKING:** deprecated in favor of new package `webpack-ui`
- `[cli]` new package with CLI tools (validate, generate, serve)
- `[webpack-plugin]` new package with webpack plugin that generated statoscope report

## 4.1.2 (24 April 2021)

### Fixes

- `[ui-webpack]` Module page: dependencies-block

## 4.1.1 (23 April 2021)

### Fixes

- `[ui-webpack]` Diff modules bug

## 4.1.0 (23 April 2021)

### Features

- `[ui-webpack]` Use module `name` instead of `identifier` to more accuracy diff
- `[ui-webpack]` Hide useless tabs at the diff page (#2130c74)

  For example, if there is no diff in the modules, then no Modules-tab will be shown

### Performance

- `[ui-webpack]` Improve starting up performance at 25% (#6966139)
- `[ui-webpack]` Huge improvement of diff performance (#1b8f346)

## 4.0.0 (23 March 2021)

### Features

- `[ui-webpack]` **BREAKING:** remove separated-styles build
- `[ui-webpack]` Handle all child compilations (#46d813c)

  Now Statoscope will handle all child compilation.
  It's useful for cases like https://github.com/GoogleChrome/workbox/issues/2785
  By default, Statoscope doesn't show any child compilation, but there is a setting `Hide child compilations` to change it.

- `[ui-webpack]` Show chunk file size (#47)

  Now Statoscope shows a little more info about a chunk

### Chore

- `[ui-webpack]` Update discovery
- `[ui-webpack]` Update build stack (webpack/babel/etc) (#3371565)
- `[ui-webpack]` Update foamtree (#9fb2116)

## 3.5.0 (21 February 2021)

### Performance

- `[plugin-webpack]` Improve stats normalization performance (#43)

## 3.4.0 (20 February 2021)

### Performance

- `[plugin-webpack]` Huge improvement for HTML-report loading time (#9b58295)

### Fixes

- `[ui-webpack]` Use `element` parameter on Statoscope init-function (#42)

## 3.3.0 (22 December 2020)

### Features

- `[plugin, ui]` Support stats with any size.

  JS engines have a string size limit (e.g. 512mb for V8). It means that JSON with a size bigger than this limitation can't be parsed with JSON.parse

  Now Statoscope uses a streaming JSON parsing (thanks to [json-ext](https://github.com/discoveryjs/json-ext)) to ignore this limitation.

- `[plugin-webpack]` Add `saveStatsTo: string` option

  You can save a webpack stats with `saveStatsTo: '/abs/path/to/stats.json'`

  Use `[name]` and `[hash]` placeholders to replace these by `compilation.name` and `compilation.hash`

- `[plugin-webpack]` Add `additionalStats: string[]` option

  You can load any stats to Statoscope to switch between them or diff these on the Diff page.

  `additionalStats: ['/abs/path/to/previous/stats.json']`

- `[plugin-webpack]` Add `statsOptions: Object` option

  You can override your webpack-config `stats` option by `statsOptions` option
  `statsOptions: { all: true, source: false }`
  All stats-options see at [docs](https://webpack.js.org/configuration/stats/#stats-options)

- `[plugin-webpack]` Add `watchMode:boolean` option

  By default, Statoscode does not generate a report if webpack run in watch-mode. Set `watchMode: true` to generate a report in watch-mode

- `[plugin-webpack]` Add `[name]` and `[hash]` placeholders to `staveTo` option to replace these by `compilation.name` and `compilation.hash`

### Fixes

- `[ui-webpack]` Fix resolving module resource that starts with `..`

## 3.2.0 (11 December 2020)

### Features

- Added webpack plugin

  Now you may use Statoscope as a webpack plugin:

  **webpack.config.js:**

  ```js
  const StatoscopeWebpackPlugin = require('@statoscope/ui-webpack');

  config.plugins.push(new StatoscopeWebpackPlugin());
  ```

  See the readme for more information.

### Chore

- Update [@discoveryjs/discovery](https://github.com/discoveryjs/discovery) to [1.0.0-beta.52](https://github.com/discoveryjs/discovery/blob/master/CHANGELOG.md#100-beta52-19-11-2020)

## 3.1.0 (01 December 2020)

### Features

- Goto first compilation when load multiple stats or a stat with multiple compilations

## 3.0.0 (01 December 2020)

### Features

- **[Breaking]**: Change data structure

  Now, Statoscope normalize the stats to a specific standardized structure.

  You can see it at [Make report](https://statoscope.tech/#report) page.

  Every stat has some basic info (filename, webpack version) and a list of the compilations.

  > The modules/chunks/assets are resolved now

  Statoscope init-function argument also changed:

  ```js
  import init from '@statoscope/ui-webpack';
  import stats from 'path/to/stats.json';

  init({
    name: 'stats.json',
    data: stats,
  });
  ```

- Stats diff

  Statoscope provides a tool to diff the stats.
  Load two or more stats to diff it.

- Support multiple stat files

  Now you can load multiple stats and switch between them.

- Support [multi-config](https://webpack.js.org/configuration/configuration-types/#exporting-multiple-configurations) projects

  If you have a multi-config project (e.g. client and server described in one config)
  then it will be splitter into a few compilations with possibility to switching between them.

- Rework main page dashboard

  Add some indicators:

  - `Total size` - size of all the assets of your bundle
  - `Initial size` - size of all the initial assets of your bundle
  - `Packages size` - size of all
  - `Duplicate modules` - total modules with the same source
  - `Build Time`

  Remove chunk groups indicator

- Add duplicate module info

  Now you can see all the modules with the same source

- Add stats validation
- Add deopt block to a module page
- Add module issuer path
- improve filtration speed

### Fixes

- Fix error in chunk packages list
- Fix incorrect chunks and modules filtration
- Fix packages list items limit

## 2.2.0 (30 October 2020)

### Features

- ctrl + click on foam-tree opens a package or module detail page,
- improved popup markup
- allow passing custom root element to init the UI
- add style-less dist

## 2.1.2 (29 October 2020)

### Fixes

- correct parsing modules name with absolute path

## 2.1.1 (29 October 2020)

### Fixes

- ignore top-level modules in stats and collect these by the chunks
- use original module name if can't normalize it
- fix exception when mouse leave a foam-tree

## 2.1.0 (29 October 2020)

### Features

- add modules reasons to the package tree

## 2.0.1 (29 October 2020)

### Fixes

- fix module page when module id is number

## 2.0.0 (29 October 2020)

- brand new webpack analyzer, webpack-runtime-analyzer was deprecated
