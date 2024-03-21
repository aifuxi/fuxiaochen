import type { BytemdPlugin } from 'bytemd';

import { copyToClipboard, isBrowser } from '@/lib/utils';

/**
 * 插件功能
 * 1. 显示代码类型
 * 2. 增加复制代码按钮
 */
export const codeBlockPlugin = (): BytemdPlugin => {
  const clipboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
	<path fill="currentColor" d="M15.24 2h-3.894c-1.764 0-3.162 0-4.255.148c-1.126.152-2.037.472-2.755 1.193c-.719.721-1.038 1.636-1.189 2.766C3 7.205 3 8.608 3 10.379v5.838c0 1.508.92 2.8 2.227 3.342c-.067-.91-.067-2.185-.067-3.247v-5.01c0-1.281 0-2.386.118-3.27c.127-.948.413-1.856 1.147-2.593c.734-.737 1.639-1.024 2.583-1.152c.88-.118 1.98-.118 3.257-.118h3.07c1.276 0 2.374 0 3.255.118A3.601 3.601 0 0 0 15.24 2" />
	<path fill="currentColor" d="M6.6 11.397c0-2.726 0-4.089.844-4.936c.843-.847 2.2-.847 4.916-.847h2.88c2.715 0 4.073 0 4.917.847c.843.847.843 2.21.843 4.936v4.82c0 2.726 0 4.089-.843 4.936c-.844.847-2.202.847-4.917.847h-2.88c-2.715 0-4.073 0-4.916-.847c-.844-.847-.844-2.21-.844-4.936z" />
</svg>`;
  const clipboardCheckIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 2A1.5 1.5 0 0 0 8 3.5v1A1.5 1.5 0 0 0 9.5 6h5A1.5 1.5 0 0 0 16 4.5v-1A1.5 1.5 0 0 0 14.5 2z"/><path fill="currentColor" fill-rule="evenodd" d="M6.5 4.037c-1.258.07-2.052.27-2.621.84C3 5.756 3 7.17 3 9.998v6c0 2.829 0 4.243.879 5.122c.878.878 2.293.878 5.121.878h6c2.828 0 4.243 0 5.121-.878c.879-.88.879-2.293.879-5.122v-6c0-2.828 0-4.242-.879-5.121c-.569-.57-1.363-.77-2.621-.84V4.5a3 3 0 0 1-3 3h-5a3 3 0 0 1-3-3zm9.012 8.511a.75.75 0 1 0-1.024-1.096l-3.774 3.522l-1.202-1.122a.75.75 0 0 0-1.024 1.096l1.715 1.6a.75.75 0 0 0 1.023 0z" clip-rule="evenodd"/></svg>`;
  const successTip = `<span style="font-size: 12px;">复制成功!</span>`;

  return {
    viewerEffect({ markdownBody }) {
      // 针对 SSR 场景适配
      if (!isBrowser()) {
        return;
      }

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
