# Statoscope

[![Build and Test](https://github.com/statoscope/statoscope/actions/workflows/node-build-and-test.yml/badge.svg)](https://github.com/statoscope/statoscope/actions/workflows/node-build-and-test.yml)
[![codecov](https://codecov.io/gh/statoscope/statoscope/branch/master/graph/badge.svg?token=0FB85kXcPz)](https://codecov.io/gh/statoscope/statoscope)
[![npm version](https://badge.fury.io/js/%40statoscope%2Fwebpack-ui.svg)](https://badge.fury.io/js/%40statoscope%2Fwebpack-ui)
[![Support](https://img.shields.io/badge/-Support-blue)](https://opencollective.com/statoscope)

Statoscope analyzes webpack stats and supplies the UI to display.

It can tell almost all about your bundle:

- 🌳 Modules/chunks/assets/packages tree
- 🗺 Entrypoints/chunks/packages map
- 🕵️ Duplicate modules and packages copies
- 🔄 Stats diff
- 📊 Custom reports about your bundle
- 🐘 No stats size limitation
- 🧪 Stats validation via CLI

You can try it at [Statoscope sandbox](https://statoscope.tech)

- [packages/webpack-plugin](packages/webpack-plugin) - webpack plugin
- [packages/webpack-ui](packages/webpack-ui) - UI for webpack stats
- [packages/cli](packages/cli) - CLI tools to analazy stats

<img src="packages/webpack-ui/docs/dashboard.png" width="500px"/>
