import { API, makeAPI } from '@statoscope/stats-validator/dist/api';
import plugin from '../..';
import statsV5 from '../../../../../test/bundles/simple/stats-prod.json';
import rule, { Params } from './';

function prepareAPI(ruleParams: Params): API {
  const pluginInstance = plugin();
  const prepared = {
    input: pluginInstance.prepare!([{ name: 'stats.json', data: statsV5 }]),
  };
  const api = makeAPI({ warnAsError: false });

  rule(ruleParams, prepared, api);

  return api;
}

type Case = {
  name: string;
  params: Params;
};

const maxDownloadTimeCases: Case[] = [
  {
    name: 'global',
    params: {
      network: 'Slow',
      global: {
        maxDownloadTime: 1,
      },
    },
  },
  {
    name: 'override global',
    params: {
      network: 'Slow',
      global: {
        maxDownloadTime: 100000,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxDownloadTime: 1,
          },
        },
      ],
    },
  },
  {
    name: 'not match - global',
    params: {
      network: 'Slow',
      global: {
        maxDownloadTime: 100000,
      },
    },
  },
  {
    name: 'not match - override global',
    params: {
      network: 'Slow',
      global: {
        maxDownloadTime: 1,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxDownloadTime: 100000,
          },
        },
      ],
    },
  },
  {
    name: 'with useCompressedSize = false',
    params: {
      network: 'Slow',
      useCompressedSize: false,
      global: {
        maxDownloadTime: 1,
      },
    },
  },
];

const maxInitialDownloadTimeCases: Case[] = [
  {
    name: 'global',
    params: {
      network: 'Slow',
      global: {
        maxInitialDownloadTime: 1,
      },
    },
  },
  {
    name: 'override global',
    params: {
      network: 'Slow',
      global: {
        maxInitialDownloadTime: 100000,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxInitialDownloadTime: 1,
          },
        },
      ],
    },
  },
  {
    name: 'not match - global',
    params: {
      network: 'Slow',
      global: {
        maxInitialDownloadTime: 100000,
      },
    },
  },
  {
    name: 'not match - override global',
    params: {
      network: 'Slow',
      global: {
        maxInitialDownloadTime: 1,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxInitialDownloadTime: 100000,
          },
        },
      ],
    },
  },
  {
    name: 'with useCompressedSize = false',
    params: {
      network: 'Slow',
      useCompressedSize: false,
      global: {
        maxInitialDownloadTime: 1,
      },
    },
  },
];

const excludeCases: Case[] = [
  {
    name: 'entry string',
    params: {
      exclude: ['two'],
      network: 'Slow',
      global: {
        maxDownloadTime: 1,
      },
    },
  },
  {
    name: 'entry regexp',
    params: {
      exclude: [/tw/],
      network: 'Slow',
      global: {
        maxDownloadTime: 1,
      },
    },
  },
  {
    name: 'entry object',
    params: {
      exclude: [{ type: 'entry', name: /tw/ }],
      network: 'Slow',
      global: {
        maxDownloadTime: 1,
      },
    },
  },
  {
    name: 'no exclude',
    params: {
      exclude: [/foooo/],
      network: 'Slow',
      global: {
        maxDownloadTime: 1,
      },
    },
  },
];

const maxAsyncSizeCDownloadTime: Case[] = [
  {
    name: 'global',
    params: {
      network: 'Slow',
      global: {
        maxAsyncDownloadTime: 1,
      },
    },
  },
  {
    name: 'override global',
    params: {
      network: 'Slow',
      global: {
        maxAsyncDownloadTime: 100000,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxAsyncDownloadTime: 1,
          },
        },
      ],
    },
  },
  {
    name: 'not match - global',
    params: {
      network: 'Slow',
      global: {
        maxAsyncDownloadTime: 100000,
      },
    },
  },
  {
    name: 'not match - override global',
    params: {
      network: 'Slow',
      global: {
        maxAsyncDownloadTime: 1,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxAsyncDownloadTime: 100000,
          },
        },
      ],
    },
  },
  {
    name: 'with useCompressedSize = false',
    params: {
      network: 'Slow',
      useCompressedSize: false,
      global: {
        maxAsyncDownloadTime: 1,
      },
    },
  },
];

describe('maxDownloadTime', () => {
  test.each(maxDownloadTimeCases)('$name', (item) => {
    const api = prepareAPI(item.params);
    expect(api.getStorage()).toMatchSnapshot();
  });
});

describe('maxInitialDownloadTime', () => {
  test.each(maxInitialDownloadTimeCases)('$name', (item) => {
    const api = prepareAPI(item.params);
    expect(api.getStorage()).toMatchSnapshot();
  });
});

describe('maxAsyncDownloadTime', () => {
  test.each(maxAsyncSizeCDownloadTime)('$name', (item) => {
    const api = prepareAPI(item.params);
    expect(api.getStorage()).toMatchSnapshot();
  });
});

describe('exclude', () => {
  test.each(excludeCases)('$name', (item) => {
    const api = prepareAPI(item.params);
    expect(api.getStorage()).toMatchSnapshot();
  });
});
