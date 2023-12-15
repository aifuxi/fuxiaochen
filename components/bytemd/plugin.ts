import toc from '@jsdevtools/rehype-toc';
import type { BytemdPlugin } from 'bytemd';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';

/**
 * 自动生成目录插件
 */
export function tocPlugin(): BytemdPlugin {
  return {
    // to be implement
    rehype: (processor) =>
      processor.use({
        plugins: [rehypeSlug, rehypeAutolinkHeadings, toc],
      }),
  };
}
