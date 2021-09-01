# Diff Entry Download Time Limits

Compares download time of entrypoints between input and reference stats

Fails if the download time of the input bundle is more than specified limit relative reference stats.

## Example

```json5
{
  "@statoscope/webpack/diff-entry-download-time-limits": [
    "error",
    {
      global: {
        maxInitialDownloadTimeDiff: 10000, // 10 sec 
      },
      network: 'Fast',
    }
  ]
}
```

**Output:**

```
- ❌ Entry "app": Download time diff of initial assets is 10 sec (15%). It's over the 10 sec limit
```

## Basics

### Limits

Basic info about limits might be found [here](/statoscope/statoscope/packages/stats-validator-plugin-webpack/docs/limits.md)

The rule has multiple limits:

```ts
type Limits = {
  maxDownloadTimeDiff?: Limit; // total download time of entrypoint
  maxInitialDownloadTimeDiff?: Limit; // total download time of initial entrypoint chunks
  maxAsyncDownloadTimeDiff?: Limit; // total download time of async entrypoint chunks
};
```

### Network

Download speed calculation has based on network speed. There are [some network types](/statoscope/statoscope/packages/stats-validator-plugin-webpack/docs/network-types.md).

## Options

```ts
type Options = {
  global?: Limits;
  byName?: Array<{
    name: string | RegExp;
    limits: Limits;
  }>;
  network: string, // see the link above
  useCompressedSize?: boolean;
  exclude?: Array<
    string |
    RegExp |
    {
      type: 'compilation' | 'entry',
      name: string
    }
  >;
}
```

### global

Specify limits for all entrypoints

```json5
{
  "@statoscope/webpack/diff-entry-download-time-limits": [
    "error",
    {
      global: {
        maxInitialDownloadTimeDiff: {
          type: 'percent',
          number: 10
        }
      }
    }
  ]
}
```

If the initial download time of any entrypoint will be increased by 10% (relative reference stats) then validation will be failed.

### byName

Specify limits for any entrypoints separately

```json5
{
  "@statoscope/webpack/diff-entry-download-time-limits": [
    "error",
    {
      byName: [
        {
          name: 'app',
          limits: {
            maxInitialDownloadTimeDiff: {
              type: 'percent',
              number: 10
            }
          }
        },
        {
          name: 'vendor',
          limits: {
            maxInitialDownloadTimeDiff: {
              type: 'percent',
              number: 5
            }
          }
        }
      ]
    }
  ]
}
```

### useCompressedSize

Use compressed size (if available) of chunks to calculate exceeding.

`true` by default.

> This option uses `@statoscope/stats-extension-compressed`

### exclude

Specify compilations or entrypoints that must be ignored.

```json5
{
  "@statoscope/webpack/diff-entry-download-time-limits": [
    "error",
    {
      global: {
        maxInitialDownloadTimeDiff: {
          type: 'percent',
          number: 10
        }
      },
      exclude: ["foo"] // or regexp
    }
  ]
}
```

There are no errors, even if download time of `foo` entrypoint will be over the limit (10%)
