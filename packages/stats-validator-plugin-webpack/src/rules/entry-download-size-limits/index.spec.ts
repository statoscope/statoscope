import { API, makeAPI } from '@statoscope/stats-validator/dist/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { Prepared } from '@statoscope/webpack-model';
import plugin from '../..';
import statsV5 from '../../../../../test/bundles/simple/stats-prod.json';
import rule, { Params } from './';

function prepareAPI(ruleParams: Params): API {
  const pluginInstance = plugin();
  const prepared: RuleDataInput<Prepared> = pluginInstance.prepare!([
    { name: 'input.json', data: statsV5 },
  ]);
  const api = makeAPI({ warnAsError: false });

  rule(ruleParams, prepared, api);

  return api;
}

type Case = {
  name: string;
  params: Params;
};

const maxSizeCases: Case[] = [
  {
    name: 'global',
    params: {
      global: {
        maxSize: 100,
      },
    },
  },
  {
    name: 'override global',
    params: {
      global: {
        maxSize: 100000,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxSize: 100,
          },
        },
      ],
    },
  },
  {
    name: 'not match - global',
    params: {
      global: {
        maxSize: 100000,
      },
    },
  },
  {
    name: 'not match - override global',
    params: {
      global: {
        maxSize: 100,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxSize: 100000,
          },
        },
      ],
    },
  },
  {
    name: 'with useCompressedSize = false',
    params: {
      useCompressedSize: false,
      global: {
        maxSize: 100,
      },
    },
  },
];

const maxInitialSizeCases: Case[] = [
  {
    name: 'global',
    params: {
      global: {
        maxInitialSize: 100,
      },
    },
  },
  {
    name: 'override global',
    params: {
      global: {
        maxInitialSize: 100000,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxInitialSize: 100,
          },
        },
      ],
    },
  },
  {
    name: 'not match - global',
    params: {
      global: {
        maxInitialSize: 100000,
      },
    },
  },
  {
    name: 'not match - override global',
    params: {
      global: {
        maxInitialSize: 100,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxInitialSize: 100000,
          },
        },
      ],
    },
  },
  {
    name: 'with useCompressedSize = false',
    params: {
      useCompressedSize: false,
      global: {
        maxInitialSize: 100,
      },
    },
  },
];

const maxAsyncSizeCases: Case[] = [
  {
    name: 'global',
    params: {
      global: {
        maxAsyncSize: 100,
      },
    },
  },
  {
    name: 'override global',
    params: {
      global: {
        maxAsyncSize: 100000,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxAsyncSize: 100,
          },
        },
      ],
    },
  },
  {
    name: 'not match - global',
    params: {
      global: {
        maxAsyncSize: 100000,
      },
    },
  },
  {
    name: 'not match - override global',
    params: {
      global: {
        maxAsyncSize: 100,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxAsyncSize: 100000,
          },
        },
      ],
    },
  },
  {
    name: 'with useCompressedSize = false',
    params: {
      useCompressedSize: false,
      global: {
        maxAsyncSize: 100,
      },
    },
  },
];

const excludeCases: Case[] = [
  {
    name: 'entry string',
    params: {
      exclude: ['two'],
      global: {
        maxSize: 1,
      },
    },
  },
  {
    name: 'entry regexp',
    params: {
      exclude: [/tw/],
      global: {
        maxSize: 1,
      },
    },
  },
  {
    name: 'entry object',
    params: {
      exclude: [{ type: 'entry', name: /tw/ }],
      global: {
        maxSize: 1,
      },
    },
  },
  {
    name: 'no exclude',
    params: {
      exclude: [/foooo/],
      global: {
        maxSize: 1,
      },
    },
  },
];

describe('maxSize', () => {
  test.each(maxSizeCases)('$name', (item) => {
    const api = prepareAPI(item.params);
    expect(api.getStorage()).toMatchSnapshot();
  });
});

describe('maxInitialSize', () => {
  test.each(maxInitialSizeCases)('$name', (item) => {
    const api = prepareAPI(item.params);
    expect(api.getStorage()).toMatchSnapshot();
  });
});

describe('maxAsyncSize', () => {
  test.each(maxAsyncSizeCases)('$name', (item) => {
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
