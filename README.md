# rempl-webpack-analyzer

Webpack plugin and UI for analyzing webpack building process through [rempl](https://github.com/rempl/rempl)

![https://cloud.githubusercontent.com/assets/6654581/21076877/59962384-bf48-11e6-862d-0bfc13244ded.png](https://cloud.githubusercontent.com/assets/6654581/21076877/59962384-bf48-11e6-862d-0bfc13244ded.png)

## Install

```bash
npm install rempl-webpack-analyzer --save-dev
```

## Usage:

```bash
npm i         # install deps
npm run build # build the UI
rempl         # run rempl server
```

> Also, you can use the [GUI](https://github.com/rempl/menubar-server) to control rempl server.

Add rempl-plugin to your webpack config:
```js
var RemplPlugin = require('rempl-webpack-analyzer');

// ...

plugins.push(new RemplPlugin());
```
    
You can use the [example](example) to see how it works:
```bash
cd example
npm i
npm run dev
```
Then open rempl server URL in your browser ([http://localhost:8177](http://localhost:8177) by default)

> Make sure that your rempl server is up.

## Plugin config

If you don't want to use default plugin config, then you can set your own config:
```js
new RemplPlugin({
    url: 'http://localhost:8177', // rempl server URL
    ui: {
        script: fs.readFileSync('/path/to/ui/bundle.js', utf-8), // packed UI bundle (js + html + css + etc...)
        url: 'http://localhost:8080' // or URL to UI
    }
});
```

> if ui.url and ui.script is specified then ui.url will used
