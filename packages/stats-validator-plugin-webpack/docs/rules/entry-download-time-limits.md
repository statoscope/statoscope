# Entry Download Time Limits

Ensures that the download time of entrypoints has not exceeded the limit.

Fails if the download time of a bundle has exceeded a limit.

## Example

```json5
{
  "@statoscope/webpack/entry-download-time-limits": [
    "error",
    {
      global: {
        maxInitialDownloadTime: 2000, // 2 sec 
      },
      network: 'Fast',
    }
  ]
}
```

**Output:**

```
- ❌ Entry "app": Download time of assets is 3.5 sec. It's over the 2 sec limit
```

## Basics

The rule has multiple limits:

```ts
type Limits = {
  maxDownloadTime?: number; // total download time of entrypoint
  maxInitialDownloadTime?: number; // total download time of initial entrypoint chunks
  maxAsyncDownloadTime?: number; // total download time of async entrypoint chunks
};
```

### Network

Download speed calculation has based on network speed. There are [some network types](/packages/stats-validator-plugin-webpack/docs/network-types.md).

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
      type: 'compilation' | 'entry' | 'asset',
      name: string
    }
  >;
}
```

### global

Specify limits for all entrypoints

```json5
{
  "@statoscope/webpack/entry-download-time-limits": [
    "error",
    {
      global: {
        maxInitialDownloadTime: 2000
      }
    }
  ]
}
```

If the initial download time of any entrypoint will be exceeded the limit (2sec) then validation will be failed.

### byName

Specify limits for any entrypoints separately

```json5
{
  "@statoscope/webpack/entry-download-time-limits": [
    "error",
    {
      byName: [
        {
          name: 'app',
          limits: {
            maxInitialDownloadTime: 1000
          }
        },
        {
          name: 'vendor',
          limits: {
            maxInitialDownloadTime: 300
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

Specify compilations name or entrypoints name that must be ignored by rule.

```json5
{
  "@statoscope/webpack/entry-download-time-limits": [
    "error",
    {
      global: {
        maxInitialDownloadTime: 1000
      },
      exclude: [
        {type: 'entrypoint', name:'foo'},
        {type: 'asset', name: /\.(map)$/}
      ]
    }
  ]
}
```

There are no errors, even if download time of `foo` entrypoint will be over the limit (10%).

Also, size of `.map` files will be ignored.
