# Build Time Limits

Ensures that the build time has not exceeded the limit.

Fails if the build time of a bundle has exceeded a limit.

## Example

```json5
{
  "@statoscope/webpack/build-time-limits": [
    "error",
    20000 // 20 sec
  ]
}
```

**Output:**

```
- ❌ Compilation "f78fdf": Build time of assets is 35 sec. It's over the 20 sec limit
```

## Options

```ts
type Options = number | {
  global?: number;
  byName?: Array<{
    name: string | RegExp;
    limits: number;
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
  "@statoscope/webpack/build-time-limits": [
    "error",
    {
      global: 2000
    }
  ]
}
```

If the build time will be exceeded the limit (2sec) then validation will be failed.

### byName

Specify limits for any compilation separately

```json5
{
  "@statoscope/webpack/build-time-limits": [
    "error",
    {
      byName: [
        {
          name: 'server',
          limits: 20000
        },
        {
          name: 'client',
          limits: 30000
        }
      ]
    }
  ]
}
```

### exclude

Specify compilations name that must be ignored by rule.

```json5
{
  "@statoscope/webpack/build-time-limits": [
    "error",
    {
      global: 10000,
      exclude: ["server"] // or regexp
    }
  ]
}
```

There are no errors, even if build time of `server` compilation will be over the limit (10sec)
