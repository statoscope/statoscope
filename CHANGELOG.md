# Changelog

## 5.19.1 (12 December 2021)

### Fixes

- `[webpack-stats-extension-package-info]` - collect more package versions

## 5.19.0 (26 November 2021)

### Feature

- `[webpack-model]` - smart handling for concat modules container id
  This improves modules diff. 
- `[helpers]` - add id modifier to indexer
- `[cli]` - add `init` and `create` commands (#139 by @wildOrlik)

## 5.18.0 (O3 November 2021)

### Features

- `[config]` - more useful error message if any of plugins or reporters from statoscope config is not installed (#137 by @amalitsky)

### Fixes

- `[webpack-model]` - fix d.ts

## 5.17.0 (27 October 2021)

### Features

- `[webpack-model]` - support grouped modules (`stats: { all: true }` in webpack 5)
- `[webpack-model]` - improved `chunkName` helper
  Now `chunkName` helper returns more accurate chunk name
- `[webpack-model]` - add `assetChunkName` helper

### Refactor

- `[webpack-model]` - total stats preparing refactoring

## 5.16.0 (25 October 2021)

### Features

- `[cli]` - Support `reference`-arg for `generate` and `serve` commands (#134)
- `[webpack-ui]` - Use `input` and `reference` files by default for diff page (#134)
- `[webpack-ui]` - Add details to chunks-tab (Added/Removed/Changed modules) at diff page. (#133 by @andreygmc)

## 5.15.0 (21 October 2021)

### Features

- `[stats-validator-plugin-webpack]` - add `description` and `alternatives` for `restricted-packages` rule (#129 by @amalitsky)

## 5.14.1 (13 October 2021)

### Fix

Republish all the packages because of npm bug

No changes

## 5.14.0 (13 October 2021)

### Features

- `[cli]` - add `query` command (#130)
- `[cli]` - add `inject-report` command

### Fixes

- `[webpack-ui]` - use report id when no report name specified

### Refactor

- `[stats-extension-custom-reports]` - handleReport returns boolean instead of throw an error

## 5.13.1 (11 October 2021)

### Fixes

- `[types]` - rename .ts to .d.ts

## 5.13.0 (09 October 2021)

### Features

- `[webpack-ui]` - update highcharts to v9
- `[webpack-ui]` - add `box`-view to build flex layout
  ```js
  [{
    view: 'box',
    content: [
      { view: 'box', content: 'struct' },
      { view: 'box', content: 'struct' },
      { view: 'box', content: 'struct' },
    ]
  },
  {
    view: 'box',
    options: { direction: 'column' },
    content: [
      { view: 'box', content: 'struct' },
      { view: 'box', content: 'struct' },
    ]
  }]
  ``` 
  There are some supported options:
  - `display`
  - `direction`
  - `shrink`
  - `grow`
  - `alignItems`
  - `justifyItems`
  - `alignContent`
  - `justifyContent`
  - `width`
  - `height`
  - `padding`
  - `margin`

- `[webpack-model]` - add `resolveExtensionByCompilation`-helper - resolves extension by id and compilation
- `[webpack-model]` - `resolveExtension*` resolves extension even if the extension has no API (not warning anymore)
- `[webpack-model]` - add StatsExtensionWebpackAdapter type
- `[webpack-plugin]` - add `extensions`-options (see plugin readme for more info)

### Refactor

- `[webpack-model]` - `resolveExtension` resolves extension by its name and filename that the extension attached to
- `[webpack-stats-extension-compressed]` - implement webpack stats extension interface
- `[webpack-stats-extension-package-info]` - implement webpack stats extension interface

## 5.12.1 (08 October 2021)

### Fixes 

- `[types]` - add types into package

## 5.12.0 (06 October 2021)

### Features

- `[cli]` - output is no longer a required argument (tmp directory is used by default) (#119 by @wildOrlik)

### Fixes

- `[webpack-model]` - fix crash when unknown extension is used
- `[webpack-model]` - fix crash with regenerator runtime

## 5.11.2 (01 October 2021)

### Fixes

- `[webpack-ui]` - fix `shouldExcludeResource`-helper
  
  Now returns true if no regexp specified

## 5.11.1 (01 October 2021)

### Build

- `[webpack-ui]` - use default target for babel-env (support more browsers)

## 5.11.0 (01 October 2021)

### Features

- `[webpack-ui]` - add new options to specify a regexp
  
  All assets matched the regexp will be ignored from download size/time calculation
- `[stats-validator-plugin-webpack]` - add asset-type exclude to `diff-entry-download-size-limits`-rule
- `[stats-validator-plugin-webpack]` - add asset-type exclude to `diff-entry-download-time-limits`-rule
- `[stats-validator-plugin-webpack]` - add asset-type exclude to `entry-download-size-limits`-rule
- `[stats-validator-plugin-webpack]` - add asset-type exclude to `entry-download-time-limits`-rule

### Refactor

- `[webpack-ui]` - improve settings popup

## 5.10.4 (29 September 2021)

### Fixes

- `[cli]` - use `>=12.0.0` instead of `^12.0.0` in engines.node

## 5.10.3 (28 September 2021)

### Fixes

- `[stats-validator-plugin-webpack]` - use compilation hash instead of compilation name

## 5.10.2 (28 September 2021)

### Fixes

- `[webpack-stats-extension-package-info]` - fix crash if there is no context in stats config

## 5.10.1 (28 September 2021)

### Fixes

- `[stats-validator-plugin-webpack]` - fix `diff-deprecated-packages` rule
- `[stats-validator-plugin-webpack]` - fix `diff-deprecated-modules` rule

## 5.10.0 (27 September 2021)

### Features

- `[webpack-ui]` - add `chart`-view (based on [highcharts](https://github.com/highcharts/highcharts))
  ```jsonc
  {
    view: 'chart,
    options: [/* any highcharts options */]
  }
  ```

## 5.9.1 (27 September 2021)

### Fixes

- `[webpack-plugin]` - fix crash if there is no context in stats config

## 5.9.0 (27 September 2021)

### Features

- `[stats-extension-custom-reports]` - add package for passing custom reports to the UI (#108)
- `[webpack-plugin]` - support custom reports (#108)
- `[webpack-ui]` - support custom reports (#108)
- `[helpers]` - support `lock`/`unlock` for `Resolver` (#107)
  By default, all the resolvers is locked (no items can be added to resolver storage)
  ```ts
  const resolver = makeResolver(modules, m => m.identifier);
  modules.push(fooModule);
  resolver('foo'); // null
  resolver.unlock(); // allow to fetch resolver storage for new elements
  modules.push(fooModule);
  resolver('foo'); // fooModule
  ```
  In other words, locked resolver remembers its source items and ignores any source changes.
  
  It is useful for performance.
- `[helpers]` - add `Indexer` to build an index (#108)
  Index is more complex of resolver. It provides some API to manipulate its storage:
  ```ts
  const moduleIndex = makeIndex(module => module.identifier); // no source needed
  moduleIndex.add(fooModule);
  moduleIndex.get('foo'); // fooModule
  moduleIndex.get('bar'); // null
  moduleIndex.add(barModule);
  moduleIndex.get('bar'); // barModule
  moduleIndex.getAll(); // [fooModule, barModule]
  ```

- `[stats-extension-compressed]` - support indexer (#108)
- `[stats-extension-package-info]` - support indexer (#108)
- `[stats-extension-stats-validation-result]` - support indexer (#108)
- `[config]` - add `requireConfig` (#108)
- `[cli]` - support `requireConfig` (#108)
- `[cli]` - add `makeReplacer` helper to create json replacer (#107)
- `[webpack-model]` - add `__statoscope.context` field (#107)
- `[report-writer]` - remove context path from stats (it makes all the path relative from context) (#107)
- `[webpack-plugin]` - remove context path from stats (it makes all the path relative from context) (#107)
- `[webpack-stats-extension-package-info]` - remove context path from stats (it makes all the path relative from context) (#107)

### Refactor

- `[webpack-model]` - use module.identifier to resolve a module (#107)
- `[webpack-model]` - decouple extension and compilation (#108)
  
  Extensions have attached to files, not to compilations

- `[webpack-ui]` - use `module.identifier` to resolve a module (#107)
- `[webpack-stats-extension-compressed]` - use `module.identifier` to resolve a module (#107)
- `[stats-validator-plugin-webpack]` - use `module.identifier` to resolve a module (#107)

### Fixes

- `[webpack-model]` - not fail when incomplete stats have used

## 5.8.1 (19 September 2021)

### Fixes

- `[stats-validator-plugin-webpack]` - fix chunk resolving in `diff-entry-download-size-limits` rule (#106)
- `[stats-validator-plugin-webpack]` - fix chunk resolving in `diff-entry-download-time-limits` rule (#106)

## 5.8.0 (15 September 2021)

### Features

- `[cli, webpack-plugin, stats-validator-reporter-stats-report]` - generate UI-reports with normalized stats (#104)
  It reduces generated UI-report size (sometimes it is more than 10x smaller)
- `[webpack-model, webpack-ui]` - support normalized UI-reports (#104)
- `[stats-validator-plugin-webpack]` - show changed reasons in diff-deprecated-modules/packages rules

### Fixes

- `[webpack-model]` - merge modules chunks info to collect more truthy info about modules chunks (#104)

## 5.7.3 (9 September 2021)

### Fixes

- `[webpack-ui]` - remove modules duplicates from modules list

### Performance

- `[webpack-ui]` - improve performance of `entries` and `modules` tabs on the main page

## 5.7.2 (9 September 2021)

### Fixes

- `[webpack-ui]` - correct set of modules in `Initial Chunks` tab on the `entry` page (closes #102)

### Chore

- `[config]` - improve error message

## 5.7.1 (1 September 2021)

### Fixes

- `[webpack-model]` - add missed json into the package

## 5.7.0 (1 September 2021)

### Features

- `[stats-validator]` - add package for validating stats
- `[stats-validator-plugin-webpack]` - add stats-validator plugin with webpack-rules
- `[stats-validator-reporter-console]` - add stats-validator reporter to output results into console
- `[stats-validator-reporter-stats-report]` -  add stats-validator reporter to output results into descovery-based UI
- `[stats-extension-stats-validation-result]` -  add stats extension to pass validation messages info descovery-based UI
- `[config]` - add package that contains config-helpers
- `[webpack-ui]` - support new validation results
  - support `stats-extension-stats-validation-result`
  - show badge in the main page
  - new page with validation results
  - new page with details of a validation message
  - mark entities (modules, chunks, packages, etc.) that have messages from the validator
  - show validation messages of the entities pages (modules, chunks, packages, etc.)
- `[webpack-ui]` - add some jora-helpers
  - `resolveEntrypoint(id: string, hash: string): NormalizedEntrypointItem | null`
    Resolve entrypoint by its name
  - `resolveFile(id: string): NormalizedFile | null`
    Resolve file by its name
  - `resolveInputFile(): NormalizedFile | null`
    Resolve file with `input.json`
  - `resolveReferenceFile(): NormalizedFile | null`
    Resolve file with `reference.json`
  - `validation_getItems(hash?: string, relatedType?: RelatedItem['type'] | null, relatedId?: string | number): Item[]`
    Get validation messages
  - `validation_getItem(id?: number, hash?: string): Item | null`
    Get validation message
  - `validation_resolveRelatedItem(item?: RelatedItem, hash?: string): ResolvedRelatedItem`
    Resolve an entity (module, chunk, etc.) that related with some message
  - `validation_resolveRule(name?: string, hash?: string): RuleDescriptor | null`
    Resolve detail info about a rule
- `[cli]` - support new validators in `validate` command
  - add `reference`-parameter
  - add `config`-parameter
  - use `stats-validator` package
- `[types]` - add package with statoscope ts-types
- `[helpers]` - add `get`-parameter into `makeResolver`-function
- `[helpers]` - add `asciiTree`-helper that generate ASCII tree from object-tree (useful for TTY-reporters)
- `[helpers]` - add a bunch of useful jora-helpers
  - `typeof(value: unknown): string`

    works like native `typeof` operator
  - `isNullish(value: unknown): boolean`

    returns `true` if `value` is `null` or `undefined`
  - `isArray(value: unknown): boolean`

    returns `true` if `value` is array
  - `useNotNullish<T>(values: readonly T[]): T | null`

    return first not-nullish element from `values`-array or `null` (`[null, 123].useNotNullish() = 123`)
  - `serializeStringOrRegexp(value?: string | RegExp): SerializedStringOrRegexp | null`

    transform string or regexp into json-compatible format
  - `deserializeStringOrRegexp(value?: SerializedStringOrRegexp | null): string | RegExp | null`

    reverse the result of `serializeStringOrRegexp`
  - `semverSatisfies(version: string | SemVer, range: string | Range): boolean`

    returns `true` if `version` satisfied of range
  - `isMatch(a?: string, b?: string | RegExp): boolean`

    returns `true` if `a` matches `b`
  - ```
    exclude<T>(
      items: readonly T[],
      params?: {
        exclude?: Array<string | RegExp>;
        get?: (arg: T) => string | undefined;
      }
    ): T[]
    ```
    Helps to exclude elements. Examples:
    - `['foo', 'bar', 'foo'].exclude({exclude: 'foo'}) = ['bar']`
    - `[fooCompilation, barCompilation, bazCompilation].exclude({exclude: /foo|bar/, get: <name>}) = [bazCompilation]`

  - `diff_normalizeLimit(limit?: number | Limit | null): Limit | null`
    Normalize the `limit`
  - `diff_isLTETheLimit(valueDiff: ValueDiff, limit?: number | Limit | null): boolean`
    Returns `true` if `valueDiff` has not been exceeded the `limit`

### Refactor

- `[report-writer]` - move `transform` function from `cli`
- `[report-writer]` - `to`-parameter of `transform` function now is required
- `[report-writer]` - `from`-parameter of `transform` might be file name or stats object
- `[cli]` - use `transform` from `report-writer`
- `[helpers]` - move `prepareWithJora` from `webpack-model`
- `[webpck-model]` - use `prepareWithJora` from `helpers`

### Fixes

- `[helpers]` - fix `max`-parameter bug in `graph_findPaths`-helper

### Deprecate

- `[cli]` - `validator` parameter in `validate` command (use statoscope config with rules instead)


## 5.6.2 (16 July 2021)

### Fixes

- `[webpack-model]` - calculating modules size on `foam-tree`-helper
- `[webpack-ui]` - show modules size on foam-tree map

## 5.6.1 (16 July 2021)

### Fixes

- `[helpers]` fix handling `max`-property in `Graph.findPaths`

## 5.6.0 (16 July 2021)

### Features

- `[webpack-ui]` add entrypoint tab into the module page. How it's possible to inspect all the paths from specific module to an entrypoint
- `[webpack-ui]` add entrypoint into issuer path
- `[helpers]` add `Graph`, `Node` and `SolutionPath` classes to solve the graph-specific tasks.
  Add a few jora-helpers:
  - `graph_getNode(id, graph)` - get a node by its id
  - `graph_getPaths(from, graph, to, max)` - get all or `max` possible paths from `from` node to `to` node

- `[webpack-model]` add `deps` for every module. There are all the modules that the module requires
- `[webpack-model]` add `dep` for every entrypoint. There is a module that an entrypoint requires
- `[webpack-model]` add `resolvedEntry` and `resolvedEntryName` for entrypoint-reasons
- `[webpack-model]` add a few jora-helpers:
  - `getModuleGraph(hash)` - get module graph for specified compilation
  - `moduleGraph_getEntrypoints(module, graph, entrypoints, max)` - get all or `max` entrypoints of `module`
  - `moduleGraph_getPaths(from, graph, to, max)` - get all or `max` possible paths from `from` module to `to` module

### Fixes

- `[webpack-ui]` fix settings error when multiple tabs opened

## 5.5.1 (08 July 2021)

### Fixes

- `[report-writer]` rollback to sync stream polling model
- `[webpack-plugin]` broken html report

### Chore

- clean all the packages from dev-files

## 5.5.0 (08 July 2021)

### Features

- `[webpack-plugin]` add new property `saveOnlyStats`
- `[webpack-plugin]` add new property `saveReportTo` (as a replacement for `saveTo`)

### Refactor

- `[webpack-plugin]` refactoring to make code more flexible
- `[report-writer]` refactor work with the streams

## 5.4.3 (06 July 2021)

### Fixes

- `[webpack-ui]` handle unresolved module reasons for a package
- `[webpack-stats-extension-package-info]` match package version for webpack 4

## 5.4.2 (05 July 2021)

### Fixes
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

  Now you could use Statoscope as a webpack plugin:

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
