[![npm](https://img.shields.io/npm/v/webpack-runtime-analyzer.svg)](https://www.npmjs.com/package/webpack-runtime-analyzer)

# webpack-runtime-analyzer

[Webpack](https://github.com/webpack/webpack) 1.x/2.x plugin for analyzing internal processes, state and structure of bundles. Built on [rempl](https://github.com/rempl/rempl).

[Watch a video-demo](https://youtu.be/Y3RVDJRi-Gc)

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

3) Start building in watch-mode (`wabpack --watch` or `webpack-dev-server`) then open [http://localhost:8177/](http://localhost:8177/) in your browser to see UI.

Try the [example](example) to see how it works:

```bash
cd example
npm i
npm run dev
```

## Plugin config

If you don't want to use default plugin config, then you can specify your own config:

```js
new RuntimeAnalyzerPlugin({
    ui: {
        script: fs.readFileSync('/path/to/ui/bundle.js', 'utf-8'), // packed UI bundle (js + html + css + etc...)
        url: 'http://localhost:8080' // or URL to UI
    }
});
```

> In case `ui.url` and `ui.script` are specified then `ui.url` will be used.

## Key features

### Dashboard

The list of the modules and the assets is always at hand.

![Dashboad](https://cloud.githubusercontent.com/assets/6654581/22832348/b88ade06-efbe-11e6-9315-5dd93335335e.png)

### Dependency graph

Take a look at the dependencies of the modules.

![Dependency graph](https://cloud.githubusercontent.com/assets/6654581/22832421/04a25a1c-efbf-11e6-9623-924da91b3118.png)

### File size map

Look at the file map and find out why your bundle is so big.

![File size map](https://cloud.githubusercontent.com/assets/6654581/22832446/1b50d7d4-efbf-11e6-8db6-26575781b595.png)

## Realtime analyzing

Analyzing process is performing in **realtime**.

![Realtime analyzing](https://cloud.githubusercontent.com/assets/6654581/22832474/35c64e96-efbf-11e6-90b3-59af1c2ea603.png)

## UI customization

The UI built on [basis.js framework](http://basisjs.com/).

* Make changes in [src/ui](src/ui)
* Run `npm run build` to build the UI bundle

> In the future you will may host and customize the UI at web server without building a bundle, but rempl does not support this feature at this moment.

## License

MIT
