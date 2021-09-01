import { RuleDescriptor } from '@statoscope/types/types/validation/api';
import { RelatedItem } from '@statoscope/types/types/validation/test-entry';
import type { Item } from '@statoscope/stats-extension-stats-validation-result/dist/generator';
import { StatoscopeWidget } from '../../types';

export type Data = {
  showRelated?: boolean;
  related?: RelatedItem;
  messages?: Item[];
};

export default function (discovery: StatoscopeWidget): void {
  discovery.view.define('validation-messages', (el, config, data?: Data, context?) => {
    const { showRelated = true } = data || {};
    discovery.view.render(
      el,
      {
        data: `
        $relatedFilter: related;
        messages
        .[
          $item: $;
          $relatedFilter ? $item.related.[type=$relatedFilter.type and id = $relatedFilter.id] : true
        ]
        .[
          rule~=#.filter or
          message~=#.filter or
          related.[id~=#.filter]
        ]
        .group(<rule>)
        .({
          rule: {name: key},
          messages: value
        })
        .sort(<rule.name>)
        `,
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
                children: showRelated ? 'related and [$.related]' : false,
                itemConfig: {
                  view: 'validation-related',
                },
              },
            },
          },
        ],
      },
      data,
      context
    );
  });
}
