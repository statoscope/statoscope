[![npm](https://img.shields.io/npm/v/webpack-runtime-analyzer.svg)](https://www.npmjs.com/package/webpack-runtime-analyzer)

# webpack-runtime-analyzer

[Webpack](https://github.com/webpack/webpack) 1.x/2.x plugin for analyzing internal processes, state and structure of bundles. Built on [rempl](https://github.com/rempl/rempl).

## Install

```bash
npm install webpack-runtime-analyzer --save-dev
```

## Usage

1) Add plugin to your webpack config:

```js
var RuntimeAnalyzerPlugin = require('webpack-runtime-analyzer');

// ...

plugins.push(new RuntimeAnalyzerPlugin());
```

2) Start [rempl server](https://github.com/rempl/rempl-cli):

```bash
rempl
```

> Also, you can use the [GUI](https://github.com/rempl/menubar-server) to control rempl server.

3) Start building in a watch mode (`> wabpack --watch` or `> webpack-dev-server`) then open [http://localhost:8177/](http://localhost:8177/) in your browser to see UI.

Try the [example](example) to see how it works:

```bash
cd example
npm i
npm run dev
```

## Key features

### Dashboard

The list of the modules and the assets is always at hand.

![Dashboad](https://cloud.githubusercontent.com/assets/6654581/23513209/4ef24f2c-ff74-11e6-9a75-cc254a4783e1.png)

Left list contains all modules that included in your bundle.

Right list contains building output (bundles, chunks, static, etc).

### Dependency graph

Take a look at the dependencies of the modules and at the modules stats.

![Dependency graph](https://cloud.githubusercontent.com/assets/6654581/23990737/0770cff0-0a48-11e7-9730-4da8c6452893.png)

#### Module types

There are a few basic module types:
- **normal** - module that you are requiring with `require(...)`
- **context** - complex module that unites other modules when you are using `require.context(...)`

Some modules can be marked as `entry`. It means that this module is declared in entry-section in you webpack-config.

Module is separated by file types (scripts, templates, styles, etc). Every file type has a different color. You can see these colors at the nodes of graph or at the color-bar above the graph.

You can hover mouse cursor at the nodes of graph or at the color bar sections and see an additional module-info or a file type statistic.

#### Controls

- zooming graph with mouse/touchpad scrolling
- changing graph position with drag and drop on the white field.
- changing rendering speed by sliding speed slider
- pause/resume graph rendering with `space`-key

### File size map

Look at the file map and find out why your bundle is so big.

![File size map](https://cloud.githubusercontent.com/assets/6654581/23513627/b610976c-ff75-11e6-8f6a-447a634a6074.png)

### Realtime analyzing

Analyzing process is performing in **realtime**.

![Realtime analyzing](https://cloud.githubusercontent.com/assets/6654581/23513658/ddb32154-ff75-11e6-93a9-29579d7c9bee.png)

### Working with a huge bundles

In a huge bundles there are many modules that are useless for analyzing.

For example, look at the [AST Explorer](https://github.com/fkling/astexplorer) bundle:

![AST Explorer modules graph](https://cloud.githubusercontent.com/assets/6654581/23990644/c87a947a-0a47-11e7-948d-681289f54c59.png)

In this case graph is not usable, moreover overloaded graph decreases rendering performance.

You can enable `Hide 3rd party modules` in the `Options` menu to hide modules that isn't requiring your project-modules.

So, `modules list`, `graph` and `file map` will be contain only modules that requiring your project-modules.

![AST Explorer modules graph with hidden 3rd party modules](https://cloud.githubusercontent.com/assets/6654581/23990815/3cabb1d0-0a48-11e7-9f84-177cad1f70d2.png)

`Hide 3rd party modules` is enabled by default.

### Webpack 1.x support

All features is working correctly with webpack 2.x and 1.x

## Plugin config

If you don't want to use default plugin config, then you can specify your own config:

```js
new RuntimeAnalyzerPlugin({
    onlyWatchMode: true,
    ui: fs.readFileSync('/path/to/ui/bundle.js', 'utf-8'), // packed UI bundle (js + html + css + etc...)
});
```

### onlyWatchMode: Boolean

Activate plugin only in a watch mode (`> webpack --watch` or `> webpack-dev-server`)

If `onlyWatchMode` is `false` then the plugin will be activated in a normal (`> webpack`) and in a watch mode (`> webpack --watch` or `> webpack-dev-server`). It means that normal building process will not be terminated after finish because the plugin is holding a permanent connection to the rempl server. The only way to terminate building process is `ctrl+c` like in a watch mode.

`true` by default.

## UI customization

The UI built on [basis.js framework](http://basisjs.com/).

* Clone this repo
* Make the changes in [src/ui](src/ui)
* Run `npm run build` to build the UI bundle to the `dist` directory
* Set an absolute path to built UI bundle in the `ui` plugin option 

## License

MIT
