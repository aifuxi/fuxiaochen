import type { BytemdPlugin } from 'bytemd';

import { copyToClipboard } from '@/lib/util';

/**
 * 插件功能
 * 1. 显示代码类型
 * 2. 增加复制代码按钮
 */
export const codeBlockPlugin = (): BytemdPlugin => {
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
