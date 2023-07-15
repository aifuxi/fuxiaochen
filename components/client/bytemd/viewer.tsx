'use client';

import { Viewer } from '@bytemd/react';
import { useMount } from 'ahooks';

import { plugins } from './config';

type Props = {
  content: string;
};

const BytemdViewer: React.FC<Props> = ({ content }) => {
  useMount(() => {
    /** 立即执行函数 IIFE避免变量全局污染 */
    (function () {
      /**
       * 复制函数
       * @param {string|undefined} text
       */
      function copyToClipboard(text = '') {
        // 创建一个textarea元素
        const textarea = document.createElement('textarea');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        textarea.value = text;
        document.body.appendChild(textarea);

        // 选择textarea元素中的文本
        textarea.select();

        // 执行复制操作
        document.execCommand('copy');

        // 移除textarea元素
        document.body.removeChild(textarea);
      }

      const clipboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`;
      const clipboardCheckIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-check"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>`;
      const successTip = `<span style="margin-left: 1em; color: #4ade80;">复制成功</span>`;
      const codeBlockList = document.querySelectorAll(
        `pre > code[class*='language-']`,
      );

      codeBlockList.forEach((codeBlock) => {
        const languageName = [...codeBlock.classList]
          .filter((item) => item.startsWith('language-'))[0]
          .split('-')
          .slice(-1)[0];
        codeBlock.setAttribute('data-language', languageName);
        codeBlock.setAttribute('style', 'position: relative;');

        const copyBtn = document.createElement('div');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        copyBtn.style = `position: absolute; top:0; right:0; display: flex; align-items: center; font-size: 16px;cursor: pointer;`;
        copyBtn.innerHTML = clipboardIcon;
        codeBlock.appendChild(copyBtn);

        copyBtn.addEventListener('click', () => {
          const code = codeBlock.textContent;
          copyToClipboard(code || '');

          copyBtn.innerHTML = clipboardCheckIcon + successTip;
          let timer: number | undefined = undefined;

          timer = window.setTimeout(() => {
            copyBtn.innerHTML = clipboardIcon;
            window.clearTimeout(timer);
            timer = undefined;
          }, 3 * 1000);
        });
      });
    })();
  });

  return <Viewer value={content} plugins={plugins} />;
};

export default BytemdViewer;
