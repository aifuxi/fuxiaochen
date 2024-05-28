import type { BytemdPlugin } from "bytemd";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

/**
 * 标题插件，给标题加上id，方便跳转
 */
export function headingPlugin(): BytemdPlugin {
  return {
    // to be implement
    rehype: (processor) =>
      processor.use({
        plugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              content: fromHtmlIsomorphic(
                '<svg viewBox="0 0 16 16" version="1.1" width="1em" height="1em" aria-hidden="true"><path fill="currentColor" d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path></svg>',
                { fragment: true },
              ).children,
              properties: {
                ariaHidden: true,
                tabIndex: -1,
                className: "markdown-anchor",
              },
            },
          ],
        ],
      }),
  };
}
