# Statoscope Package Custom Reports

[![npm version](https://badge.fury.io/js/%40statoscope%2Fstats-extension-package-info.svg)](https://badge.fury.io/js/%40statoscope%2Fstats-extension-custom-reports)
[![Financial Contributors on Open Collective](https://opencollective.com/statoscope/all/badge.svg?label=financial+contributors)](https://opencollective.com/statoscope)

Statoscope extension to store custom reports in stats.

A custom report is:

```ts
export type Report<TData, TContext> = {
  id: string; // report id
  name?: string; // report title
  compilation?: string | null; // if specified then a report will be shown only in specific compilation
  data?: TData | (() => Promise<TData> | TData); // raw data for the report or a function that produces a data (may return promise)
  view: string | ViewConfig<TData, TContext>; // any DiscoveryJS. String turns to script to eval
};
```

## View as a script

Sometimes we need to make a report with more complex view (e.g. with event handling).

JSON can't handle functions, but you can pass any script source into `view`-property instead of JSON.

This source will be `eval`ed on client and should return any DiscoveryJS view.

**my-custom-report-view.js:**
```js
(() => [
  {
    view: 'button',
    data: {
      text: 'Click me',
    },
    onClick() {
      alert('It works!');
    },
  },
])();
```

**Report config:**
```js
({
  id: 'foo',
  view: fs.readFileSync('./my-custom-report-view.js', 'utf8')
})
```
