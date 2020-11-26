# Statoscope for webpack

[![npm version](https://badge.fury.io/js/%40statoscope%2Fui-webpack.svg)](https://badge.fury.io/js/%40statoscope%2Fui-webpack)
[![Donate](https://img.shields.io/badge/-Donate-blue)](https://opencollective.com/statoscope)

Statoscope analyzes webpack stats and shows detailed info about it on the screen.

You can try it at [Statoscope sandbox](https://statoscope.tech)

## Installation

```sh
npm install @statoscope/ui-webpack --save-dev
```

## Usage

**1\.** Collect the bundle stats with:

```sh
webpack --json > stats.json
```

**2\.** Pass stats file to Statoscope

```js
import init from '@statoscope/ui-webpack';
import stats from 'path/to/stats.json'

init(stats);
```

### Importing styles

`import init from '@statoscope/ui-webpack'` imports a bundle with builtin scripts and styles.

To import scripts and styles separately, use:

```js
import '@statoscope/ui-webpack/dist/split/main.css';
import init from '@statoscope/ui-webpack/dist/split/main.js';

init(stats);
```

### Getting stats from a boilerplate project

If you're using Create React App then use `--stats` argument to get the stats:

`yarn build --stats` or `npm run build -- --stats`

This will create `build/undle-stats.json` that can be used in Statoscope.

## Key-features list

### Entry points

Shows entry points with their chunks, modules, assets, and used packages.

<img src="docs/entries.png" width="300px"/>

### Modules

Shows a tree of the modules with their dependencies and reasons. You can simply find out why a module was bundled.

<img src="docs/modules.png" width="300px"/>
 
### Chunks

Shows all the chunk in the bundle, split by a type, with a tree of the modules and packages in these chunks.

<img src="docs/chunks.png" width="300px"/>

### Assets

Shows all the chunk in the bundle with a tree of the modules and packages in these chunks.

<img src="docs/asssets.png" width="300px"/>

### Packages

Shows all the packages (node_modules) in the bundle all of their copies and the reasons.

<img src="docs/packages.png" width="300px"/>

> This is only a short description of Statoscope features. Just try it by yourself and find out more about your bundle.

## Supporting

If you are an engineer or a company that is interested in Statoscope improvements, you may support Statoscope by financial contribution at [OpenCollective](https://opencollective.com/statoscope).
