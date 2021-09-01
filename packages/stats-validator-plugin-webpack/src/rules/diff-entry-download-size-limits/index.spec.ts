import { makeAPI } from '@statoscope/stats-validator/dist/api';
import { RuleDataInput } from '@statoscope/stats-validator/dist/rule';
import { Prepared } from '@statoscope/webpack-model';
import { API } from '@statoscope/types/types/validation/api';
import plugin from '../..';
import referenceStats from '../../../../../test/bundles/simple/stats-prod.json';
import afterStats from '../../../../../test/bundles/simple/stats-dev.json';
import rule, { Params } from './';

function prepareAPI(ruleParams: Params): API {
  const pluginInstance = plugin();
  const prepared: RuleDataInput<Prepared> = pluginInstance.prepare!([
    { name: 'input.json', data: afterStats },
    { name: 'reference.json', data: referenceStats },
  ]);
  const api = makeAPI();

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
        maxSizeDiff: 100,
      },
    },
  },
  {
    name: 'override global',
    params: {
      global: {
        maxSizeDiff: 100000,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxSizeDiff: 100,
          },
        },
      ],
    },
  },
  {
    name: 'not match - global',
    params: {
      global: {
        maxSizeDiff: 100000,
      },
    },
  },
  {
    name: 'not match - override global',
    params: {
      global: {
        maxSizeDiff: 100,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxSizeDiff: 100000,
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
        maxSizeDiff: 100,
      },
    },
  },
];

const maxInitialSizeCases: Case[] = [
  {
    name: 'global',
    params: {
      global: {
        maxInitialSizeDiff: 100,
      },
    },
  },
  {
    name: 'override global',
    params: {
      global: {
        maxInitialSizeDiff: 100000,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxInitialSizeDiff: 100,
          },
        },
      ],
    },
  },
  {
    name: 'not match - global',
    params: {
      global: {
        maxInitialSizeDiff: 100000,
      },
    },
  },
  {
    name: 'not match - override global',
    params: {
      global: {
        maxInitialSizeDiff: 100,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxInitialSizeDiff: 100000,
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
        maxInitialSizeDiff: 100,
      },
    },
  },
];

const maxAsyncSizeCases: Case[] = [
  {
    name: 'global',
    params: {
      global: {
        maxAsyncSizeDiff: 100,
      },
    },
  },
  {
    name: 'override global',
    params: {
      global: {
        maxAsyncSizeDiff: 100000,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxAsyncSizeDiff: 100,
          },
        },
      ],
    },
  },
  {
    name: 'not match - global',
    params: {
      global: {
        maxAsyncSizeDiff: 100000,
      },
    },
  },
  {
    name: 'not match - override global',
    params: {
      global: {
        maxAsyncSizeDiff: 100,
      },

      byName: [
        {
          name: /.+/,
          limits: {
            maxAsyncSizeDiff: 100000,
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
        maxAsyncSizeDiff: 100,
      },
    },
  },
];

describe('maxSizeDiff', () => {
  test.each(maxSizeCases)('$name', (item) => {
    const api = prepareAPI(item.params);
    expect(api.getStorage()).toMatchSnapshot();
  });
});

describe('maxInitialSizeDiff', () => {
  test.each(maxInitialSizeCases)('$name', (item) => {
    const api = prepareAPI(item.params);
    expect(api.getStorage()).toMatchSnapshot();
  });
});

describe('maxAsyncSizeDiff', () => {
  test.each(maxAsyncSizeCases)('$name', (item) => {
    const api = prepareAPI(item.params);
    expect(api.getStorage()).toMatchSnapshot();
  });
});
