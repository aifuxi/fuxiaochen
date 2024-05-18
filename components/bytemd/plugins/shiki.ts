/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';
import { type BytemdPlugin } from 'bytemd';
import { load } from 'cheerio';
import { isNil } from 'lodash-es';
// 支持大部分语言高亮，体积更大
import { bundledLanguages, codeToHtml } from 'shiki/bundle-full.mjs';

// 仅支持部分语言高亮，体积更小
// import { codeToHtml } from 'shiki/bundle-full.mjs';

/**
 * 代码灵感来源：https://github.com/bytedance/bytemd/issues/34
 */
/**
 * ByteMD plugin to show the code block with shiki
 * @param options The options for shiki
 */
export function shikiPlugin(): BytemdPlugin {
  return {
    viewerEffect({ markdownBody }) {
      const els = markdownBody.querySelectorAll<HTMLElement>('pre>code');
      if (els.length === 0) return;
      els.forEach(async (el) => {
        let lang = el.className.replace('language-', '');
        // 当没有匹配到语言时，使用文本文件（txt也可以上plain或者text）兜底
        // 参考：https://shiki.style/languages#special-languages
        lang = Object.keys(bundledLanguages)
          .map((el) => el.toLowerCase())
          .includes(lang)
          ? lang
          : 'txt';
        el.className = `${el.className} shiki-code`;
        const codeGet = el.textContent || '';

        // codeToHtml生成的字符串 => <pre class="shiki xxx"><code>xxxx</code></pre>
        // 需要再次解析，拿到其中的 class style等属性和里面的code内容
        // 然后全部复制给当前代码块的pre标签
        const code = await codeToHtml(codeGet, {
          lang,
          themes: {
            light: 'vitesse-light',
            dark: 'vitesse-black',
          },
          // transformer 有啥用看这个链接：https://shiki.style/packages/transformers#install
          transformers: [
            // diff 高亮
            transformerNotationDiff(),
            transformerNotationDiff(),

            // 单词高亮
            transformerNotationWordHighlight(),
            transformerMetaWordHighlight(),

            // 代码行高亮
            transformerNotationHighlight(),
            transformerMetaHighlight(),
          ],
        });

        // 用cheerio解析codeToHtml生成的html字符串
        const $ = load(code);
        if (!isNil(el.parentElement)) {
          // 把解析后的属性及内容全部复制给当前匹配到的代码块的pre标签
          const obj = $('pre').attr();
          if (obj) {
            Object.entries(obj).forEach(([k, v]) => {
              el.parentElement!.setAttribute(k, v);
            });
          }
          el.parentElement.innerHTML = $('pre>code').html() || '';
        }
      });
    },
  };
}
