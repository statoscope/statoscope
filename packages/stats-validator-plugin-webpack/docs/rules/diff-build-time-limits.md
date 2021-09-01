# Diff Build Time Limits

Compares build time between input and reference stats

Fails if the build time of the input bundle is more than specified limit relative reference stats.

## Example

```json5
{
  "@statoscope/webpack/diff-build-time-limits": [
    "error",
    10000, // 10 sec
  ]
}
```

**Output:**

```
- ❌ Compilation "f78fdf": Build time diff is 15 sec (15%). It's over the 10 sec limit
```

## Basics

### Limits

Basic info about limits might be found [here](/statoscope/statoscope/packages/stats-validator-plugin-webpack/docs/limits.md)

## Options

```ts
type Options = number | {
  global?: Limit;
  byName?: Array<{
    name: string | RegExp;
    limits: Limit;
  }>;
  exclude?: Array<
    string |
    RegExp |
    {
      type: 'compilation',
      name: string
    }
  >;
}
```

### global

Specify limits for all compilations

```json5
{
  "@statoscope/webpack/diff-build-time-limits": [
    "error",
    {
      global: {
        type: 'percent',
        number: 10
      }
    }
  ]
}
```

If the build time will be increased by 10% (relative reference stats) then validation will be failed.

### byName

Specify limits for any compilation separately

```json5
{
  "@statoscope/webpack/diff-build-time-limits": [
    "error",
    {
      byName: [
        {
          name: 'server',
          limits: {
            type: 'percent',
            number: 10
          }
        },
        {
          name: 'client',
          limits: {
            type: 'percent',
            number: 5
          }
        }
      ]
    }
  ]
}
```

### exclude

Specify compilations that must be ignored.

```json5
{
  "@statoscope/webpack/diff-build-time-limits": [
    "error",
    {
      global: {
        type: 'percent',
        number: 10
      },
      exclude: ["server"] // or regexp
    }
  ]
}
```

There are no errors, even if build time of `server` compilation will be over the limit (10%)
