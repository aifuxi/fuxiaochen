import toc from '@jsdevtools/rehype-toc';
import type { BytemdPlugin } from 'bytemd';
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
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
                className: 'markdown-anchor',
              },
            },
          ],
          toc,
        ],
      }),
  };
}

/**
 * 1. 显示代码类型
 * 2. 增加复制代码按钮
 */
export function codeBlockPlugin(): BytemdPlugin {
  const clipboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`;
  const clipboardCheckIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-check"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>`;
  const successTip = `<span style="font-size: 14px;">复制成功!</span>`;

  return {
    viewerEffect({ markdownBody }) {
      const preElements = Array.from(markdownBody.querySelectorAll('pre'));

      preElements.forEach((el) => {
        // 查找 pre 元素里面的 code 元素
        const code = el.querySelector('code');

        // eg: language-shell:install.sh => shell
        const language = code?.className
          ?.split(' ')
          ?.filter((cs) => cs.startsWith('language'))[0]
          ?.split('-')[1]
          ?.split(':')[0];

        // 给 pre 元素添加自定义属性，标识当前pre里面代码的类型，在 CSS 里面可通过attr(data-language)拿到这个值
        el.setAttribute('data-language', language ?? 'unknown');

        const copyBtn = document.createElement('div');
        copyBtn.setAttribute('class', 'copy-code-button');
        copyBtn.innerHTML = clipboardIcon;

        // 如果已经存在复制按钮了，不再插入
        if (!el.querySelector('.copy-code-button')) {
          el.appendChild(copyBtn);
        }

        // 点击按钮复制代码到粘贴板
        copyBtn.addEventListener('click', () => {
          let codeText = el.textContent ?? '';
          // 复制代码时去除开头的$符号，然后trim一下，一般是复制shell命令的代码块会用到
          if (codeText.startsWith('$')) {
            codeText = codeText.slice(1).trim();
          }

          navigator.clipboard
            .writeText(codeText)
            .then(() => {
              copyBtn.innerHTML = clipboardCheckIcon + successTip;
              let timer = 0;

              timer = window.setTimeout(() => {
                copyBtn.innerHTML = clipboardIcon;
                window.clearTimeout(timer);
                timer = 0;
              }, 3 * 1000);
            })
            .catch(() => {
              alert('复制代码出错');
            });
        });
      });
    },
  };
}

/**
 * 将内容里面的外部链接打开方式为_blank
 */
export function modifyHrefTargetPlugin(): BytemdPlugin {
  return {
    viewerEffect({ markdownBody }) {
      Array.from(markdownBody.querySelectorAll('a'))
        .filter((a) => {
          const href = a.getAttribute('href');
          return Boolean(href && href.startsWith('http'));
        })
        .forEach((a) => {
          a.setAttribute('target', '_blank');
        });
    },
  };
}
