[![npm](https://img.shields.io/npm/v/webpack-runtime-analyzer.svg)](https://www.npmjs.com/package/webpack-runtime-analyzer)

# webpack-runtime-analyzer

[Webpack](https://github.com/webpack/webpack) 1.x/2.x plugin for analyzing internal processes, state and structure of bundles. Built on [rempl](https://github.com/rempl/rempl).

## Install

```bash
npm install webpack-runtime-analyzer --save-dev
```

## Usage

Add plugin to your webpack config:

```js
var RuntimeAnalyzerPlugin = require('webpack-runtime-analyzer');

// ...

plugins: [new RuntimeAnalyzerPlugin()]
```

You can set optional configuration for `RuntimeAnalyzerPlugin` constructor with this defaults:

```js
new RuntimeAnalyzerPlugin({
    // Can be `standalone` or `publisher`.
    // In `standalone` mode analyzer will start rempl server in exclusive publisher mode.
    // In `publisher` mode you should start rempl on your own.
    mode: 'standalone',
    // Port that will be used in `standalone` mode to start rempl server.
    // When set to `0` a random port will be choosen.
    port: 0,
    // Automatically open analyzer in default browser. Works for `standalone` mode only.
    open: false,
    // Use analyzer only when Webpack run in a watch mode. Set it to `false` to use plugin
    // in any Webpack mode. Take in account that building process will not be terminated
    // when done since the plugin holds a connection to the rempl server. The only way
    // to terminate building process is using `ctrl+c` like in a watch mode.
    watchModeOnly: true
})
```

For `publisher` mode you should start [rempl server](https://github.com/rempl/rempl-cli) on your own:

```bash
npm install -g rempl-cli
rempl
```

> Also, you can use the [GUI](https://github.com/rempl/menubar-server) to control rempl server.

After you run Webpack you can open web interface of analyzer.

- In `standalone` mode the link to the web interface will be printed after build is done. With `open` option set to `true`, the web interface will be opened in default browser automatically.
- In `publisher` mode your should open url of rempl server, usually it's [http://localhost:8177/](http://localhost:8177/). You can set custom rempl server url via `REMPL_SERVER` env variable.

Try the [example](example) to see how it works:

```bash
cd example
npm i
npm run dev
```

## Key features

### Dashboard

The list of the modules and the assets is always at hand.

<img src="https://cloud.githubusercontent.com/assets/6654581/24293210/a8d77e7a-10a1-11e7-8b86-29f753bbc516.png" width="500px"/>

#### The left list

The left list contains all modules that included in your bundle.

- `Id` - module ID
- `Name` - short module name 
- `Size` - module size
- `Occurrences` - how many modules require this module.
- `Retain` - see bellow 
- `Exclusive` - see bellow

#### The right list

The right list contains building output (chunks, static, etc).

#### Retained

Displays how many modules are **required by** this module and by all its dependencies (recursive).

For example, we have three modules: `foo`, `bar` and `baz`.

If `foo` requires `bar` and `bar` requires `baz` then:
- retained of `foo` is 2 (`bar` and `baz`)
- retained of `bar` is 1 (`baz`)
- retained of `baz` is 0

#### Exclusive

Displays how many modules are required **only** by this module and by all its dependencies (recursive).

For example, we have three modules: `foo`, `bar` and `baz`.

**Case 1**: If `foo` requires `bar` then `foo` exclusive is `1` because no more modules that require `bar`.

**Case 2**: If `foo` and `bar` requires `baz` then:
 - `foo` exclusive is `0` because `bar` also requires `baz`.
 - `bar` exclusive is `0` because `foo` also requires `baz`.

**Case 3**: If `foo` requires `bar` and `bar` requires `baz` then:

 - `foo` exclusive is `2` because no more modules that require `bar` and `baz`
 - `bar` exclusive is `1` because no more modules that require `baz`
 
### Dependency graph

Take a look at the dependencies of the modules and at the modules stats.

<img src="https://cloud.githubusercontent.com/assets/6654581/23990737/0770cff0-0a48-11e7-9730-4da8c6452893.png" width="500px"/>

#### Module types

There are a few basic module types:
- **normal** - module that you are requiring with `require(...)`
- **context** - complex module that unites other modules when you are using `require.context(...)`

Some modules can be marked as `entry`. It means that this module is declared in `entry` section in you webpack-config.

The modules is separated by file types (scripts, templates, styles, etc). Every file type has a different color. You can see these colors at the nodes of graph or at the color bar above the graph.

You can hover mouse cursor at the nodes of graph or at the color bar sections and see an additional module-info or a file type statistic.

#### Controls

- zooming graph with mouse/touchpad scrolling
- changing graph position with drag and drop on the white field.
- changing rendering speed by sliding speed slider
- pause/resume graph rendering with `space`-key

### File size map

Look at the file map and find out why your bundle is so big.

<img src="https://cloud.githubusercontent.com/assets/6654581/24315369/a88e3c6e-10f7-11e7-91ba-9b7f7025c4e5.png" width="500px"/>

### Realtime analyzing

Analyzing process is performing in **realtime**.

<img src="https://cloud.githubusercontent.com/assets/6654581/23513658/ddb32154-ff75-11e6-93a9-29579d7c9bee.png" width="500px"/>

### Working with huge bundles

In huge bundles, there are many modules that are useless for analyzing.

For example, look at the [AST Explorer](https://github.com/fkling/astexplorer) bundle:

<img src="https://cloud.githubusercontent.com/assets/6654581/23990644/c87a947a-0a47-11e7-948d-681289f54c59.png" width="500px"/>

In this case graph is not usable, moreover overloaded graph decreases rendering performance.

You can enable `Hide 3rd party modules` in the `Options` menu to hide modules that aren't requiring your project modules.

So, `modules list`, `graph` and `file map` will contain only modules that requiring your project modules.

<img src="https://cloud.githubusercontent.com/assets/6654581/23990815/3cabb1d0-0a48-11e7-9f84-177cad1f70d2.png" width="500px"/>

`Hide 3rd party modules` is enabled by default.

### Integration

You can use Webpack Runtime Analyzer everywhere when having an access to a web-view (e.g. web pages, browser plugins, mobile browsers and applications).

#### Atom Editor

Some code editors have an access to a web view (e.g. `iframe`) and there is a great opportunity to integrate Webpack Runtime Analyzer in these editors and use **unique editor features**.

You can use Webpack Runtime Analyzer in [Atom Editor](https://atom.io/) by installed [the plugin](https://atom.io/packages/rempl-host).

This plugin creates a `bridge` between the editor and Webpack Runtime Analyzer. It allows you to open the UI **directly in an editor tab** and observing current editing file.

##### Open UI in editor

Just type `Rempl` in command palette and enter rempl-server url (http://localhost:8177 by default).

##### Info about editing file

If the editing file is part of the bundle, then you can see some info about it in several places:
- Environment page of the UI (contains all modules that retained by the editing file)
- the status bar of the UI 
- the status bar of the Editor (two-way communication)
 
<img src="https://cloud.githubusercontent.com/assets/6654581/24292331/f384beb4-109d-11e7-9a46-4eff5f4b53b9.gif" width="500px"/>

> Environment page and status bar exist only when the UI is running within editor

#### How about other editors?

[VS Code](https://code.visualstudio.com/) support is in plans...

### Webpack 1.x support

All features is working correctly with webpack 2.x and 1.x

## License

MIT
