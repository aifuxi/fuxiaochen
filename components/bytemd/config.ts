import breaks from '@bytemd/plugin-breaks';
import frontmatter from '@bytemd/plugin-frontmatter';
import gfm from '@bytemd/plugin-gfm';
import gfm_zhHans from '@bytemd/plugin-gfm/lib/locales/zh_Hans.json';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import { type EditorProps } from '@bytemd/react';
import { merge } from 'lodash-es';

import { headingPlugin, prettyLinkPlugin, shikiPlugin } from './plugins';

export const plugins = [
  breaks(),
  frontmatter(),
  mediumZoom(),
  gfm({ locale: gfm_zhHans }),
  prettyLinkPlugin(),
  shikiPlugin(),
  headingPlugin(),
];

export const sanitize: EditorProps['sanitize'] = (schema) => {
  const customerSchema = merge(schema, {
    tagNames: ['iframe'],
    attributes: {
      iframe: [
        'src',
        'style',
        'title',
        'all',
        'sandbox',
        'scrolling',
        'border',
        'frameborder',
        'framespacing',
        'allowfullscreen',
      ],
    },
  } as typeof schema);

  return customerSchema;
};
