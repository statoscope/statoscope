export function generateColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return colorFromH(h);
}

export function colorFromH(h: string | number): string {
  return getHSLValue(h, 50, 85);
}

export function getHSLValue(
  h: string | number,
  s: string | number,
  l: string | number
): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export const fileTypeMap: { [key: string]: string } = {
  '.wasm': 'wasm',
  '.json': 'json',
  '.html': 'html',

  '.js': 'script',
  '.jsx': 'script',
  '.es6': 'script',
  '.ts': 'script',
  '.tsx': 'script',
  '.flow': 'script',
  '.coffee': 'script',
  '.mjs': 'script',

  '.css': 'style',
  '.styl': 'style',
  '.scss': 'style',
  '.sass': 'style',
  '.less': 'style',

  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.svg': 'image',

  '.eot': 'font',
  '.ttf': 'font',
  '.woff': 'font',
  '.woff2': 'font',
};

export type ColorMap = { [key: string]: { color: string } };

export function createColorsFromString(strings: string[] | Set<string>): ColorMap {
  const step = Math.round(360 / (strings instanceof Set ? strings.size : strings.length));
  let currentStep = 0;
  const all: ColorMap = {};
  for (const value of strings) {
    all[value] = { color: colorFromH(currentStep) };
    currentStep += step;
  }

  return all;
}

export const colorMap = {
  ...createColorsFromString(new Set(Object.values(fileTypeMap))),
};
