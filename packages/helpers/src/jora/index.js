/* global module, require */

const path = require('path');
const { colorFromH, colorMap, fileTypeMap, generateColor } = require('./colors');
const { pluralEng, pluralRus } = require('./plural');

module.exports = () => {
  return {
    stringify: JSON.stringify,
    toNumber(str) {
      return parseInt(str, 10);
    },
    formatSize(value) {
      const sign = Math.sign(value);
      value = Math.abs(value);

      if (isFinite(value)) {
        if (value < 1000 * 1000) {
          return (sign * (value / 1024)).toFixed(2) + ' kb';
        }

        return (sign * (value / 1024 / 1024)).toFixed(2) + ' mb';
      }
      return 'n/a';
    },
    formatDate(value) {
      return new Date(value).toLocaleString();
    },
    formatDuration(value) {
      const sign = Math.sign(value);
      value = Math.abs(value);

      if (isFinite(value)) {
        if (value < 1000) {
          return (sign * value).toFixed(0) + ' ms';
        }

        return (sign * (value / 1000)).toFixed(0) + ' sec';
      }
      return 'n/a';
    },
    percentFrom(a, b, toFixed) {
      if (a && !b) {
        return 100;
      }

      if (!a && !b) {
        return 0;
      }

      const p = (a / b - 1) * 100;

      if (typeof toFixed !== 'undefined') {
        return p.toFixed(toFixed);
      }

      return p;
    },
    toFixed(value, digits = 2) {
      return value.toFixed(digits);
    },
    color: (value) => (colorMap[value] ? colorMap[value].color : generateColor(value)),
    fileExt: (value = '') => {
      return path.extname(value);
    },
    fileType: (value = '') => {
      const extname = path.extname(value);
      return fileTypeMap[extname] || extname;
    },
    toMatchRegexp: (value) => new RegExp(`(${value})`),
    colorFromH,
    plural(value, words) {
      return pluralEng.plural(value, words);
    },
    pluralWithValue(value, words) {
      return pluralEng.pluralWithValue(value, words);
    },
    pluralRus(value, words) {
      return pluralRus.plural(value, words);
    },
    pluralWithValueRus(value, words) {
      return pluralRus.pluralWithValue(value, words);
    },
  };
};
