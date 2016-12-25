[![npm](https://img.shields.io/npm/v/webpack-runtime-analyzer.svg)](https://www.npmjs.com/package/webpack-runtime-analyzer)

# webpack-runtime-analyzer

[Webpack](https://github.com/webpack/webpack) plugin for analyzing internal processes, state and structure of bundles. Built on [rempl](https://github.com/rempl/rempl).

[Watch a video-demo](https://youtu.be/Y3RVDJRi-Gc)

## Install

```bash
npm install webpack-runtime-analyzer --save-dev
```

## Usage

Add plugin to your webpack config:

```js
var RuntimeAnalyzerPlugin = require('webpack-runtime-analyzer');

// ...

plugins.push(new RuntimeAnalyzerPlugin());
```

Start [rempl server](https://github.com/rempl/rempl-cli):

```bash
rempl
```

> Also, you can use the [GUI](https://github.com/rempl/menubar-server) to control rempl server.

Try the [example](example) to see how it works:

```bash
cd example
npm i
npm run dev
```

Then open rempl server URL in your browser ([http://localhost:8177](http://localhost:8177) by default)

> Make sure that your rempl server is up.

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

![Dashboad](https://cloud.githubusercontent.com/assets/6654581/21473114/cb2bfa72-cb0b-11e6-8096-3e05f6c967f9.png)

### Dependency graph

Take a look at the dependencies of the modules.

![Dependency graph](https://cloud.githubusercontent.com/assets/6654581/21473113/cb156dac-cb0b-11e6-82ab-990d60a798dd.png)

### File size map

Look at the file map and find out why your bundle is so big.

![File size map](https://cloud.githubusercontent.com/assets/6654581/21473112/cb13ffa8-cb0b-11e6-9cb3-0935a788ffce.png)

## Realtime analyzing

Analyzing process is performing in **realtime**.

![Realtime analyzing](https://cloud.githubusercontent.com/assets/6654581/21473129/850a287e-cb0c-11e6-8f7f-9c55aea96e3f.png)

## UI customization

The UI built on [basis.js framework](http://basisjs.com/).

* Make changes in [src/ui](src/ui)
* Run `npm run build` to build the UI bundle

> In the future you will may host and customize the UI at web server without building a bundle, but rempl does not support this feature at this moment.

## License

MIT
