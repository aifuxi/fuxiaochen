/* eslint-disable */
// @ts-nocheck
import type { BytemdPlugin } from "bytemd";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { visit } from "unist-util-visit";

import { copyToClipboard, isBrowser } from "@/lib/utils";

const copyBtnNode = fromHtmlIsomorphic(`
<div class="copy-code-button">
<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
</div>
`);

const clipboardCheckIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-check"><path d="m12 15 2 2 4-4"/><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const successTip = `<span style="font-size: 0.75em;">复制成功!</span>`;

/**
 * 插件功能
 * 1. 显示代码类型
 * 2. 增加复制代码按钮
 */
export const codeBlockPlugin = (): BytemdPlugin => {
  return {
    rehype: (process) =>
      process.use(() => (tree) => {
        visit(tree, "element", (node) => {
          if (node.tagName === "pre") {
            node.children.push(copyBtnNode);
          }

          visit(tree, "element", (code, idx, parent) => {
            if (code.tagName === "code") {
              const language = code.properties?.className
                ?.filter((cs) => cs.startsWith("language"))[0]
                ?.split("-")[1]
                ?.split(":")[0];

              if (language && !parent.properties["data-language"]) {
                parent.properties["data-language"] = language;
              }
            }
          });
        });
      }),

    viewerEffect({ markdownBody }) {
      // 针对 SSR 场景适配
      if (!isBrowser()) {
        return;
      }

      const elements = markdownBody.querySelectorAll(".copy-code-button");
      for (const element of elements) {
        // 点击按钮复制代码到粘贴板
        element.addEventListener("click", () => {
          let codeText = element.textContent ?? "";
          // 复制代码时去除开头的$符号，然后trim一下，一般是复制shell命令的代码块会用到
          if (codeText.startsWith("$")) {
            codeText = codeText.slice(1).trim();
          }
          copyToClipboard(element.parentElement?.textContent?.trim() || "");

          const tmp = element.innerHTML;
          element.innerHTML = clipboardCheckIcon + successTip;
          let timer = 0;

          timer = window.setTimeout(() => {
            element.innerHTML = tmp;
            window.clearTimeout(timer);
            timer = 0;
          }, 3 * 1000);
        });
      }
    },
  };
};
