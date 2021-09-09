# Diff Entry Download Size Limits

Compares download size of entrypoints between input and reference stats.

Fails if the download size of the input bundle is more than specified limit relative reference stats.

## Example

```json5
{
  "@statoscope/webpack/diff-entry-download-size-limits": [
    "error",
    {
      global: {
        maxInitialSizeDiff: 512000, // 500kb 
      },
    }
  ]
}
```

**Output:**

```
- ❌ Entry "app": Download size diff of initial assets is 0.98 mb (10.70%). It's over the 0.5 kb limit
```

## Basics

Basic info about limits might be found [here](/packages/stats-validator-plugin-webpack/docs/limits.md)

The rule has multiple limits:

```ts
type Limits = {
  maxSizeDiff?: Limit; // total size of entrypoint
  maxInitialSizeDiff?: Limit; // total size of initial entrypoint chunks
  maxAsyncSizeDiff?: Limit; // total size of async entrypoint chunks
};
```

## Options

```ts
type Options = {
  global?: Limits;
  byName?: Array<{
    name: string | RegExp;
    limits: Limits;
  }>;
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
  "@statoscope/webpack/diff-entry-download-size-limits": [
    "error",
    {
      global: {
        maxInitialSizeDiff: {
          type: 'percent',
          number: 10
        }
      }
    }
  ]
}
```

If the initial download size of any entrypoint will be increased by 10% (relative reference stats) then validation will be failed.

### byName

Specify limits for any entrypoints separately

```json5
{
  "@statoscope/webpack/diff-entry-download-size-limits": [
    "error",
    {
      byName: [
        {
          name: 'app',
          limits: {
            maxInitialSizeDiff: {
              type: 'percent',
              number: 10
            }
          }
        },
        {
          name: 'vendor',
          limits: {
            maxInitialSizeDiff: {
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

Use compressed size (if available) of chunks to calculate limit exceeding.

`true` by default.

> This option uses `@statoscope/stats-extension-compressed`

### exclude

Specify compilations name or entrypoints name that must be ignored by rule.

```json5
{
  "@statoscope/webpack/diff-entry-download-size-limits": [
    "error",
    {
      global: {
        maxInitialSizeDiff: {
          type: 'percent',
          number: 10
        }
      },
      exclude: ["foo"] // or regexp
    }
  ]
}
```

There are no errors, even if download size of `foo` entrypoint will be over the limit (10%)
