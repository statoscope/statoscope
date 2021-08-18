import { RuleDescriptor } from '@statoscope/types/types/validation';
import { StatoscopeWidget } from '../../types';

export default function (discovery: StatoscopeWidget): void {
  discovery.page.define('stats-validation', [
    {
      data: '#.params.hash.resolveStat()',
      view: 'switch',
      content: [
        {
          when: 'not compilation',
          content: 'stats-list',
        },
        {
          when: 'compilation',
          content: [
            {
              view: 'switch',
              data: `compilation.hash.validation_getItems()`,
              content: [
                {
                  when: 'not $',
                  content:
                    'alert-warning:"The validation messages from `" + #.id.decodeURIComponent() + "` compilation was not found"',
                },
                {
                  content: [
                    {
                      view: 'page-header',
                      content: 'h1:"Validation messages"',
                    },
                    {
                      view: 'content-filter',
                      content: {
                        data: `
                        .[
                          rule~=#.filter or
                          message~=#.filter or
                          related.[id~=#.filter]
                        ]
                        .group(<rule>)
                        .({
                          rule: {name: key},
                          messages: value
                        })`,
                        view: 'block',
                        content: [
                          {
                            view: 'tree',
                            expanded: false,
                            itemConfig: {
                              content: [
                                {
                                  view: 'text-match',
                                  data: `{text: rule.name, match: #.filter}`,
                                },
                                {
                                  view: (
                                    el: HTMLDivElement,
                                    config: unknown,
                                    data: RuleDescriptor
                                  ): void => {
                                    el.style.display = 'inline-block';
                                    el.style.marginLeft = '5px';
                                    el.textContent = 'ℹ️';
                                    el.title = data.description!;
                                  },
                                  when: `rule.name.validation_resolveRule(#.params.hash).description`,
                                  data: 'rule.name.validation_resolveRule(#.params.hash)',
                                },
                              ],
                              children: 'messages',
                              itemConfig: {
                                content: [
                                  `text: type='error' ? '❌' : (type = 'warn' ? '⚠️' : 'ℹ️')`,
                                  {
                                    view: 'link',
                                    data: `{
                                      text: message,
                                      match: #.filter,
                                      href: id.pageLink('stats-validation-message', {hash: #.params.hash})
                                    }`,
                                    content: 'text-match',
                                  },
                                ],
                                children: 'related and [$.related]',
                                itemConfig: {
                                  view: 'validation-related',
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
}
