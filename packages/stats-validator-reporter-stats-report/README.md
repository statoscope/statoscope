# stats-validator-reporter-stats-report

[![npm version](https://badge.fury.io/js/%40statoscope%2Fstats-validator-reporter-stats-report.svg)](https://badge.fury.io/js/%40statoscope%2Fstats-validator-reporter-stats-report)
[![Support](https://img.shields.io/badge/-Support-blue)](https://opencollective.com/statoscope)

UI reporter for @statoscope/stats-validator.

Injects validator's result into stats and generates a Statoscope report 

## Options

```ts
type Options = {
  saveReportTo?: string; // a path to save HTML report (temporary dir with random file name by default)
  saveStatsTo?: string; // a path to save JSON stats (does not save stats by default)
  open?: boolean; // open generated Statoscope report (false by default)
};
```

## Examples

**statoscope.config.js:**

```json
{
  "validate": {
    "reporters": [["@statoscope/stats-report", { "open": true }]]
  }
}
```

Generate UI report and open it.

**statoscope.config.js:**

```json
{
  "validate": {
    "reporters": [["@statoscope/stats-report", { "saveStatsTo": "/path/to/new/stats.json" }]]
  }
}
```

Just inject validation result into stats and save it.
