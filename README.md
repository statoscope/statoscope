# rempl-webpack-analyzer

Webpack plugin and UI for analyzing webpack building process through [rempl](https://github.com/rempl/rempl)

## Usage:

```bash
rempl server  # run rempl server
npm i         # install deps
npm run build     # build the UI
```

> Also, you can use the [GUI](https://github.com/rempl/menubar-server) to control rempl server.

Add rempl-plugin to your webpack config:
```js
var RemplPlugin = require('rempl-webpack-analyzer');

// ...

config.plugins.push(new RemplPlugin({
  webpack: webpack, // pass the webpack instance
  url: 'http://localhost:8177', // URL of rempl server
  ui: {
    url: fs.readFileSync('/path/to/dist/ui/script.js', { encoding: 'utf-8' }) // builded UI bundle
  }
}));
```
    
You can use the [example](example) to see how it works:
```bash
cd example
npm i
npm run dev
```
Then open rempl server URL in your browser (e.g. [http://localhost:8177](http://localhost:8177))

<img width="839" alt="screenshot at 09 13-33-21" src="https://cloud.githubusercontent.com/assets/6654581/21046112/19195d2e-be14-11e6-97bc-3cbf63f882b3.png">
