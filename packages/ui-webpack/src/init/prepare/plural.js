export function pluralFactory(pluralFn) {
  return {
    plural: pluralFn,
    pluralWithValue(value, words) {
      return `${value} ${pluralFn(value, words)}`;
    },
  };
}

export const pluralRus = pluralFactory((value, [one, two, five = two]) => {
  let n = Math.abs(value);

  n %= 100;

  if (n >= 5 && n <= 20) {
    return five;
  }

  n %= 10;

  if (n === 1) {
    return one;
  }

  if (n >= 2 && n <= 4) {
    return two;
  }

  return five;
});

export const pluralEng = pluralFactory((value, [one, many]) => {
  const n = Math.abs(value);

  return n === 0 || n > 1 ? many : one;
});
