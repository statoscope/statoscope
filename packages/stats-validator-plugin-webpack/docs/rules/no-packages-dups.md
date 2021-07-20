
# Disallow duplicates of packages

Fail validation if some of the packages have more than one instance (directory with a package in the `node_modules`).

## Example

There are two instances for the `foo`-package:

- `node_modules/foo`
- `node_modules/bar/node_modules/foo`

```json
{
  "no-packages-dups": ["error"]
}
```

There will be an error.

## Options

```ts
type Options = {
  exclude?: string[]
}
```

### exclude

Specify the packages that may have more than one instance:

```json
{
  "no-packages-dups": [
    "error",
    {
      "exclude": ["foo"]
    }
  ]
}
```

There will be no error, even if `foo`-package has more than one instances

> Consider not to use exclude-option to make your bundle less excess
