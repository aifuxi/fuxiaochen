import type { BytemdPlugin } from 'bytemd';

import { copyToClipboard } from '@/lib/utils';

/**
 * 插件功能
 * 1. 显示代码类型
 * 2. 增加复制代码按钮
 */
export const codeBlockPlugin = (): BytemdPlugin => {
  const clipboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M8 3.5A1.5 1.5 0 0 1 9.5 2h5A1.5 1.5 0 0 1 16 3.5v1A1.5 1.5 0 0 1 14.5 6h-5A1.5 1.5 0 0 1 8 4.5z"/><path fill="currentColor" fill-rule="evenodd" d="M6.5 4.037c-1.258.07-2.052.27-2.621.84C3 5.756 3 7.17 3 9.998v6c0 2.829 0 4.243.879 5.122c.878.878 2.293.878 5.121.878h6c2.828 0 4.243 0 5.121-.878c.879-.88.879-2.293.879-5.122v-6c0-2.828 0-4.242-.879-5.121c-.569-.57-1.363-.77-2.621-.84V4.5a3 3 0 0 1-3 3h-5a3 3 0 0 1-3-3zM6.25 10.5A.75.75 0 0 1 7 9.75h10a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1-.75-.75m1 3.5a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75m1 3.5a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75" clip-rule="evenodd"/></svg>`;
  const clipboardCheckIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2z"/><path fill="currentColor" fill-rule="evenodd" d="M6.5 4.037c-1.258.07-2.052.27-2.621.84C3 5.756 3 7.17 3 9.998v6c0 2.829 0 4.243.879 5.122c.878.878 2.293.878 5.121.878h6c2.828 0 4.243 0 5.121-.878c.879-.88.879-2.293.879-5.122v-6c0-2.828 0-4.242-.879-5.121c-.569-.57-1.363-.77-2.621-.84V4.5a3 3 0 0 1-3 3h-5a3 3 0 0 1-3-3zm9.012 8.511a.75.75 0 1 0-1.024-1.096l-3.774 3.522l-1.202-1.122a.75.75 0 0 0-1.024 1.096l1.715 1.6a.75.75 0 0 0 1.023 0z" clip-rule="evenodd"/></svg>`;
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

          copyToClipboard(codeText);
          copyBtn.innerHTML = clipboardCheckIcon + successTip;
          let timer = 0;

          timer = window.setTimeout(() => {
            copyBtn.innerHTML = clipboardIcon;
            window.clearTimeout(timer);
            timer = 0;
          }, 3 * 1000);
        });
      });
    },
  };
};

/**
 * 将内容里面的外部链接打开方式为_blank
 */
export const modifyHrefTargetPlugin = (): BytemdPlugin => {
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
};
