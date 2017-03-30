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
    // in any Webpack mode. Take into account that a building process will not be terminated
    // when done since the plugin holds a connection to the rempl server. The only way
    // to terminate building process is using `ctrl+c` like in a watch mode.
    watchModeOnly: true,
    // Which editor should open the files 
    // Possible editors IDs see bellow
    editor: 'EDITOR_ID'
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

<img src="https://cloud.githubusercontent.com/assets/6654581/24501455/418b2220-1552-11e7-9e2d-bf5cbb6774ae.gif" width="500px"/>

#### The left list

The left list contains all modules in your bundle.

Click on a module name to view detail info about the module.

Click on a module name withholding `shift`-key to open a file that related with this module in your editor.

#### The right list

The right list contains building output (chunks, static, etc).
 
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

#### Controls

- click to some block to expose it
- press `escape` to return to the root

### Module details

Displays more useful details about the modules.

<img src="https://cloud.githubusercontent.com/assets/6654581/24500842/cdcfe6ec-154f-11e7-9935-da7564db6765.png" width="500px"/>

In the text input you can choose a module or a file which info you want to see. Just start typing module/file name and choose it from suggestion list.

In the table you can see some modules statistic:

#### Require

Displays modules are required by chosen module/file.

#### Occurrences

Displays modules are requiring chosen module/file.

#### Retained

Displays modules that required by chosen module/file **recursively**.

For example, we have three modules: `foo`, `bar` and `baz`.

If `foo` requires `bar` and `bar` requires `baz` then:
- retained of `foo` is 2 (`bar` and `baz`)
- retained of `bar` is 1 (`baz`)
- retained of `baz` is 0

#### Exclusive

Displays modules are required **only** by this module/file and by all its dependencies **recursively**.

For example, we have three modules: `foo`, `bar` and `baz`.

**Case 1**: If `foo` requires `bar` then `foo` exclusive is `1` because no more modules that require `bar`.

**Case 2**: If `foo` and `bar` requires `baz` then:
 - `foo` exclusive is `0` because `bar` also requires `baz`.
 - `bar` exclusive is `0` because `foo` also requires `baz`.

**Case 3**: If `foo` requires `bar` and `bar` requires `baz` then:

 - `foo` exclusive is `2` because no more modules that require `bar` and `baz`
 - `bar` exclusive is `1` because no more modules that require `baz`

#### Controls

- click on a module name to view detail info about the module
- click on a module name withholding `shift`-key to open a file that related with this module in your editor

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

### Open in editor

You can open any bundle file in you favorite editor. Just set the `editor` option with one of the supported editor ID and click to any file path withholding `shift`-key to open the file in a chosen editor.

#### Supported editors:

- `sublime` – Sublime Text
- `atom` – Atom Editor
- `code` – Visual Studio Code
- `webstorm` – WebStorm
- `phpstorm` - PhpStorm
- `idea14ce` – IDEA 14 CE
- `vim` – Vim (via Terminal, Mac OS only)
- `emacs` – Emacs (via Terminal, Mac OS only)
- `visualstudio` – Visual Studio

> Chosen editor must be installed in your system

### Integration

You can use Webpack Runtime Analyzer everywhere when having an access to a web-view (e.g. web pages, browser plugins, mobile browsers and applications).

#### Atom Editor

Some code editors have access to a web view (e.g. iframe) and this is a great opportunity to integrate Webpack Runtime Analyzer in these editors to use unique editor features.

You can use Webpack Runtime Analyzer in [Atom Editor](https://atom.io/) by installed [the plugin](https://atom.io/packages/rempl-host).

This plugin creates a `bridge` between the editor and Webpack Runtime Analyzer. It allows you to open the UI **directly in an editor tab** and observing current editing file.

##### Open UI in editor

Just type `Rempl` in command palette and enter rempl-server url (http://localhost:8177 by default).

##### Info about editing file

If the editing file is a part of the bundle, you can see the info about it in the following places:
- `details` page in the UI
- the bottom bar of the UI 
- the status bar of the Editor (two-way communication)
 
<img src="https://cloud.githubusercontent.com/assets/6654581/24501273/75170e70-1551-11e7-85b0-729646529b29.gif" width="500px"/>

> The bottom bar exists only when the UI is running within editor

#### How about other editors?

[VS Code](https://code.visualstudio.com/) support is in plans... But if you want it faster, then like [this comment](https://github.com/Microsoft/vscode/issues/22068#issuecomment-287776122) ;)

### Webpack 1.x support

All features is working correctly with webpack 2.x and 1.x

## License

MIT
