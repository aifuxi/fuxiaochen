import breaks from '@bytemd/plugin-breaks';
import frontmatter from '@bytemd/plugin-frontmatter';
import gemoji from '@bytemd/plugin-gemoji';
import gfm from '@bytemd/plugin-gfm';
import gfm_zhHans from '@bytemd/plugin-gfm/lib/locales/zh_Hans.json';
import highlightSSR from '@bytemd/plugin-highlight-ssr';
import math from '@bytemd/plugin-math';
import math_zhHans from '@bytemd/plugin-math/lib/locales/zh_Hans.json';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import mermaid from '@bytemd/plugin-mermaid';
import mermaid_zhHans from '@bytemd/plugin-mermaid/lib/locales/zh_Hans.json';
import { type EditorProps } from '@bytemd/react';
import { merge } from 'lodash-es';

import { codeBlockPlugin, modifyHrefTargetPlugin, tocPlugin } from './plugin';

export const plugins = [
  breaks(),
  frontmatter(),
  gemoji(),
  gfm({ locale: gfm_zhHans }),
  highlightSSR(),
  math({ locale: math_zhHans }),
  mermaid({ locale: mermaid_zhHans }),
  mediumZoom(),
  tocPlugin(),
  modifyHrefTargetPlugin(),
  codeBlockPlugin(),
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
