# Entry Download Size Limits

Ensures that the download size of entrypoints has not exceeded the limit.

Fails if the download size of a bundle has exceeded a limit.

## Example

```json5
{
  "@statoscope/webpack/entry-download-size-limits": [
    "error",
    {
      global: {
        maxInitialSize: 512000, // 500kb 
      },
    }
  ]
}
```

**Output:**

```
- ❌ Entry "app": Download size of initial assets is 300.61 kb. It's over the 500 kb limit
```

## Basics

The rule has multiple limits:

```ts
type Limits = {
  maxSize?: number; // total size of entrypoint
  maxInitialSize?: number; // total size of initial entrypoint chunks
  maxAsyncSize?: number; // total size of async entrypoint chunks
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
  "@statoscope/webpack/entry-download-size-limits": [
    "error",
    {
      global: {
        maxInitialSize: 512000, // 500kb
      }
    }
  ]
}
```

If the initial download size of any entrypoint will be exceeded the limit (500kb) then validation will be failed.

### byName

Specify limits for any entrypoints separately

```json5
{
  "@statoscope/webpack/entry-download-size-limits": [
    "error",
    {
      byName: [
        {
          name: 'app',
          limits: {
            maxInitialSize: 512000, // 500kb
          }
        },
        {
          name: 'vendor',
          limits: {
            maxInitialSize: 2048000, // 2mb
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
  "@statoscope/webpack/entry-download-size-limits": [
    "error",
    {
      global: {
        maxInitialSize: 512000, // 500kb
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
