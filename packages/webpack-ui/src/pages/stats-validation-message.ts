import { StatoscopeWidget } from '../../types';
// @ts-ignore
import styles from './stats-validation-message.css';

export default function (discovery: StatoscopeWidget): void {
  discovery.page.define('stats-validation-message', [
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
              data: `#.id.validation_getItem(compilation.hash)`,
              content: [
                {
                  when: 'not $',
                  content:
                    'alert-warning:"The validation message with ID `" + #.id + "` was not found"',
                },
                {
                  when: '$',
                  data: `
                  $item: $;
                  $details: details.[type="discovery"].pick();
                  $targetFile: #.stats.[name=$details.filename];
                  $deserialized: $details.deserialize.content.query($details.serialized);
                  {
                    item: $,
                    rule: $item.rule.validation_resolveRule(#.params.hash),
                    input: $deserialized,
                    query: $details.query,
                    data: $details.query.query($targetFile, $deserialized.context),
                    view: $details.view
                  }
                  `,
                  content: [
                    {
                      view: 'page-header',
                      prelude: 'badge:{ text: "Validation Message" }',
                      content: {
                        view: 'h1',
                        data: `(item.type='error' ? '❌' : (item.type = 'warn' ? '⚠️' : 'ℹ️')) + ' ' + item.message`,
                      },
                    },
                    {
                      when: 'not input and not query and not data and not view',
                      view: 'alert',
                      data: '"There is no additional data in this message"',
                    },
                    {
                      when: 'view',
                      view: 'expand',
                      expanded: true,
                      header: 'text:"View"',
                      content: {
                        view: 'custom-view',
                        data: '{view, data}',
                      },
                    },
                    {
                      when: 'item.related',
                      view: 'expand',
                      expanded: '=not view',
                      header: 'text:"Related with"',
                      content: {
                        view: 'block',
                        className: styles.related,
                        content: {
                          view: 'content-filter',
                          content: {
                            view: 'validation-related',
                            data: `item.related.[
                            $resolved: validation_resolveRelatedItem(#.params.hash);
                            $resolved.item.id~=#.filter or $resolved.item.name~=#.filter or $resolved.item.path~=#.filter
                          ]`,
                          },
                        },
                      },
                    },
                    {
                      when: 'data',
                      view: 'expand',
                      header: 'text:"Raw data"',
                      expanded: '=not view and not item.related',
                      content: {
                        view: 'struct',
                        data: 'data',
                        expanded: true,
                      },
                    },
                    {
                      when: 'input',
                      view: 'expand',
                      header: 'text:"Query input"',
                      content: {
                        view: 'struct',
                        data: `input`,
                        expanded: true,
                      },
                    },
                    {
                      when: 'query',
                      view: 'expand',
                      header: 'text:"Query source"',
                      content: {
                        view: 'source',
                        data: `{content:query, syntax: 'discovery-query'}`,
                      },
                    },
                    {
                      when: 'view',
                      view: 'expand',
                      header: 'text:"View source"',
                      content: {
                        view: 'source',
                        data: `{content:view.typeof()='string'?view:view.stringify(null, 2), syntax: 'discovery-view'}`,
                      },
                    },
                    {
                      when: 'rule',
                      view: 'expand',
                      header: 'text:"Rule"',
                      content: {
                        view: 'struct',
                        data: `rule`,
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
