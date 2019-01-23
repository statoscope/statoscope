import transport from './transport';
import * as discoveryLib from '@discoveryjs/discovery/dist/lib.umd';
import prepare from './prepare';
import * as pages from './pages/';
import * as views from './views/';

const discovery = new discoveryLib.App(document.body, {});
const globalData = {};
const context = {
  name: 'Webpack build data',
  // raw: data.raw,
  createdAt: new Date().toISOString(),
};

console.log(discoveryLib);
console.log(discovery);

discovery.apply(discoveryLib.router);
discovery.setPrepare(prepare);
discovery.setData(globalData, context);

discovery.addBadge(
  'Messages',
  () => discovery.setPage('messages'),
  (host) => host.pageId !== 'messages'
);

discovery.addBadge(
  'Deoptimization',
  () => discovery.setPage('deopts'),
  (host) => host.pageId !== 'deopts'
);

function generateColor(value) {
  return 'hsl(' + String(value).split('').reduce((r, c) => (r + r ^ c.charCodeAt(0)), 0) + ', 50%, 85%)';
}

const colorMap = {
  script: {
    color: '#fbee8e'
  },
  style: {
    color: '#a3d9ef'
  },
  image: {
    color: '#ffbaad'
  }
};

const fileTypeMap = {
  '.js': 'script',
  '.jsx': 'script',
  '.es6': 'script',
  '.ts': 'script',
  '.tsx': 'script',
  '.css': 'style',
  '.styl': 'style',
  '.scss': 'style',
  '.sass': 'style',
  '.less': 'style',
  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.svg': 'image',
};

discovery.addQueryHelpers({
  encodeURIComponent: encodeURIComponent,
  decodeURIComponent: decodeURIComponent,
  stringify: JSON.stringify,
  toNumber(str) {
    return parseInt(str, 10);
  },
  formatSize(value) {
    if (isFinite(value)) {
      if (value < 1024) {
        return value.toFixed(2) + ' bytes';
      }

      if (value < 1024 * 1024) {
        return (value / 1024).toFixed(2) + ' kb';
      }

      return (value / 1024 / 1024).toFixed(2) + ' mb';
    }

    return 'n/a';
  },
  color: value => colorMap[value] ? colorMap[value].color : generateColor(value),
  fileType: value => fileTypeMap[value] || value,
  reportLink: function(current) {
    return '#report';
    // if (Array.isArray(current)) {
    //   return discovery.reportLink(current[0]);
    // }
    //
    // return discovery.reportLink(current);
  }
});

discovery.apply(views);

// discovery.pages('default', []);
discovery.apply(pages);

transport.ns('data').subscribe(data => {
  console.log('channel(data)', data);
  globalData.data = data;
  discovery.setData(globalData, { ...context, data });
});

transport.ns('status').subscribe(data => {
  console.log('channel(status)', data);
  globalData.status = data;
  discovery.renderPage();
});
