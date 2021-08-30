# Limits

The basic limit description is:

```ts
type Limit = number | // treats as absolute limit
  { type: 'absolute'; number: number } |
  { type: 'percent'; number: number };
```

The absolute limit measures in kilobytes. Limit exceeding calculating as:

`isOverTheLimit` = `input size` - `reference size` > `number`

Percent limit exceeding calculating as:

`isOverTheLimit` = `input size` / `reference size` * `100` > `number`
