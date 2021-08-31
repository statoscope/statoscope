# Statoscope

[![Build and Test](https://github.com/statoscope/statoscope/actions/workflows/ci.yml/badge.svg)](https://github.com/statoscope/statoscope/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/statoscope/statoscope/branch/master/graph/badge.svg?token=0FB85kXcPz)](https://codecov.io/gh/statoscope/statoscope)
[![npm version](https://badge.fury.io/js/%40statoscope%2Fwebpack-plugin.svg)](https://badge.fury.io/js/%40statoscope%2Fwebpack-plugin)
[![Support](https://img.shields.io/badge/-Support-blue)](https://opencollective.com/statoscope)

Statoscope is a toolkit for analyzing (with UI-base report) and validate stats of your bundle.

**Key features:**

- 🌳 Full dependency tree (modules/chunks/assets/entrypoints/packages)
- 🗺 Size map (entrypoints/chunks/packages)
- 🕵️ Packages copies and duplicates of modules detection
- 🧪 Stats validation with a bunch of useful rules (e.g. on CLI)
- 🔄 Stats comparison
- 📊 Custom reports for your stats
- 🐘 No stats size limitation

You can try it at [Statoscope sandbox](https://statoscope.tech)

- [packages/webpack-plugin](packages/webpack-plugin) - webpack plugin for generating a UI-based report about your bundle
- [packages/cli](packages/cli) - CLI tools for validating your stats

<img src="packages/webpack-ui/docs/dashboard.png" width="500px"/>
