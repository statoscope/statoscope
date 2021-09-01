# stats-validator-plugin-webpack

[![npm version](https://badge.fury.io/js/%40statoscope%2Fstats-validator-plugin-webpack.svg)](https://badge.fury.io/js/%40statoscope%2Fstats-validator-plugin-webpack)
[![Support](https://img.shields.io/badge/-Support-blue)](https://opencollective.com/statoscope)

Webpack stats validator plugin for @statoscope/stats-validator

This package contains rules to validate a webpack bundle.

## Rules

- [build-time-limits.md](docs/rules/build-time-limits.md]) - Ensures that the build time has not exceeded the limit 
- [diff-build-time-limits.md](docs/rules/diff-build-time-limits.md) - Compares build time between input and reference stats. Fails if build time has increased
- [diff-deprecated-modules](docs/rules/diff-deprecated-modules.md) - Compares usage of specified modules between input and reference stats
- [diff-deprecated-packages](docs/rules/diff-deprecated-packages.md) - Compares usage of specified packages usage between input and reference stats
- [diff-entry-download-size-limits](docs/rules/diff-entry-download-size-limits.md) - Diff download size of entrypoints between input and reference stats
- [diff-entry-download-time-limits](docs/rules/diff-entry-download-time-limits.md) - Diff download time of entrypoints between input and reference stats
- [entry-download-size-limits](docs/rules/entry-download-size-limits.md) - Ensure that the download size of entrypoints is not over the limit
- [entry-download-time-limits](docs/rules/entry-download-time-limits.md) - Ensure that the download time of entrypoints is not over the limit
- [no-modules-deopts](docs/rules/no-modules-deopts.md) - Ensures that bundle doesn't have modules with deoptimization
- [no-packages-dups](docs/rules/no-packages-dups.md) - Ensures that bundle hasn't package duplicates
- [restricted-modules](docs/rules/restricted-modules.md) - Ensures that bundle doesn't use specified modules
- [restricted-packages](docs/rules/restricted-packages.md) - Ensures that bundle doesn't use specified packages
