[![npm](https://img.shields.io/npm/v/rempl-webpack-analyzer.svg)](https://www.npmjs.com/package/rempl-webpack-analyzer)

# rempl-webpack-analyzer

[Webpack](https://github.com/webpack/webpack) plugin for analyzing internal processes, state and structure of bundles. Built on [rempl](https://github.com/rempl/rempl)

![Rempl Webpack Analyzer](https://cloud.githubusercontent.com/assets/6654581/21410682/a691eaca-c7f3-11e6-84c1-cbc43fd40dd2.png)

## Install

```bash
npm install rempl-webpack-analyzer --save-dev
```

## Usage

Add plugin to your webpack config:

```js
var RemplPlugin = require('rempl-webpack-analyzer');

// ...

plugins.push(new RemplPlugin());
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
new RemplPlugin({
    ui: {
        script: fs.readFileSync('/path/to/ui/bundle.js', 'utf-8'), // packed UI bundle (js + html + css + etc...)
        url: 'http://localhost:8080' // or URL to UI
    }
});
```

> In case `ui.url` and `ui.script` are specified then `ui.url` will be used.

## UI customization

The UI built [basis.js framework](http://basisjs.com/)

* Make changes in [src/ui](src/ui)
* Run `npm run build` to build the UI bundle

> In the future you will may host and customize the UI at web server without building a bundle, but rempl does not support this feature at this moment

## License

MIT
