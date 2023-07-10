import breaks from '@bytemd/plugin-breaks';
import frontmatter from '@bytemd/plugin-frontmatter';
import gemoji from '@bytemd/plugin-gemoji';
import gfm from '@bytemd/plugin-gfm';
import highlightSSR from '@bytemd/plugin-highlight-ssr';
import mediumZoom from '@bytemd/plugin-medium-zoom';

export const plugins = [
  gfm(),
  breaks(),
  frontmatter(),
  gemoji(),
  highlightSSR(),
  mediumZoom(),
];
