function generateColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return colorFromH(h);
}

function colorFromH(h) {
  return getHSLValue(h, 50, 85);
}

function getHSLValue(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

const fileTypeMap = {
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

function createColorsFromString(strings) {
  const step = Math.round(360 / (strings.length || strings.size || 0));
  let currentStep = 0;
  const all = {};
  for (const value of strings) {
    all[value] = { color: colorFromH(currentStep) };
    currentStep += step;
  }

  return all;
}

const colorMap = {
  ...createColorsFromString(new Set(Object.values(fileTypeMap))),
};

module.exports = {
  generateColor,
  colorFromH,
  getHSLValue,
  fileTypeMap,
  createColorsFromString,
  colorMap,
};
