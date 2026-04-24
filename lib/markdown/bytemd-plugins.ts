import breaks from "@bytemd/plugin-breaks";
import frontmatter from "@bytemd/plugin-frontmatter";
import gfm from "@bytemd/plugin-gfm";
import gfm_zhHans from "@bytemd/plugin-gfm/lib/locales/zh_Hans.json";
import highlightSsr from "@bytemd/plugin-highlight-ssr";
import mediumZoom from "@bytemd/plugin-medium-zoom";
import type { BytemdPlugin, ViewerProps } from "bytemd";
import { common } from "lowlight";

// highlight需要额外扩充的高亮语言
import asciidoc from "highlight.js/lib/languages/asciidoc";
import dart from "highlight.js/lib/languages/dart";
import nginx from "highlight.js/lib/languages/nginx";

import { createHeadingIdGenerator } from "@/lib/markdown-headings";

import { siteCopy } from "@/constants/site-copy";

const iframeAttributes = [
  "src",
  "title",
  "width",
  "height",
  "allow",
  "allowFullScreen",
  "allowfullscreen",
  "loading",
  "referrerPolicy",
  "referrerpolicy",
  "frameBorder",
  "frameborder",
  "sandbox",
  "className",
];

type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  value?: unknown;
  children?: HastNode[];
};

function getNodeText(node: HastNode): string {
  if (typeof node.value === "string") {
    return node.value;
  }

  return node.children?.map(getNodeText).join("") ?? "";
}

function appendClassName(value: unknown, className: string) {
  if (Array.isArray(value)) {
    return [...value, className];
  }

  if (typeof value === "string") {
    return `${value} ${className}`;
  }

  return [className];
}

async function writeClipboardText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function headingIdPlugin(): BytemdPlugin {
  return {
    rehype: (processor) =>
      processor.use(() => (tree: HastNode) => {
        const nextHeadingId = createHeadingIdGenerator();

        function visit(node: HastNode) {
          if (
            node.type === "element" &&
            (node.tagName === "h2" || node.tagName === "h3")
          ) {
            const text = getNodeText(node);
            node.properties = {
              ...node.properties,
              className: appendClassName(
                node.properties?.className,
                "scroll-mt-24",
              ),
              id: nextHeadingId(text),
            };
          }

          node.children?.forEach(visit);
        }

        visit(tree);
      }),
  };
}

function codeCopyPlugin(): BytemdPlugin {
  return {
    viewerEffect: ({ markdownBody }) => {
      const cleanupCallbacks: Array<() => void> = [];

      const enhanceCodeBlocks = () => {
        markdownBody.querySelectorAll("pre").forEach((pre) => {
          const code = pre.querySelector("code");
          if (!code || pre.querySelector(".prose-code-copy")) return;

          const button = document.createElement("button");
          button.type = "button";
          button.className = "prose-code-copy";
          button.textContent = siteCopy.blogPost.copyCode;
          button.setAttribute("aria-label", siteCopy.blogPost.copyCode);

          const resetButtonText = () => {
            button.textContent = siteCopy.blogPost.copyCode;
          };

          const scheduleReset = () => {
            const timeoutId = window.setTimeout(resetButtonText, 1800);
            cleanupCallbacks.push(() => window.clearTimeout(timeoutId));
          };

          const handleClick = (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();

            void writeClipboardText(code.textContent ?? "")
              .then(() => {
                button.textContent = siteCopy.blogPost.copiedCode;
                scheduleReset();
              })
              .catch(() => {
                button.textContent = siteCopy.blogPost.copyCodeFailed;
                scheduleReset();
              });
          };

          button.addEventListener("click", handleClick);
          pre.append(button);

          cleanupCallbacks.push(() => {
            button.removeEventListener("click", handleClick);
            button.remove();
          });
        });
      };

      const observer = new MutationObserver(enhanceCodeBlocks);

      enhanceCodeBlocks();
      observer.observe(markdownBody, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
        cleanupCallbacks.forEach((cleanup) => cleanup());
      };
    },
  };
}

export const markdownPlugins: BytemdPlugin[] = [
  breaks(),
  frontmatter(),

  gfm({ locale: gfm_zhHans }),
  highlightSsr({
    ignoreMissing: true,
    languages: {
      // @bytemd/plugin-highlight-ssr 是基于 rehype-highlight 的封装
      // 而 rehype-highlight 是基于 lowlight 的封装
      // 使用 lowlight 中一个叫 common 的配置对象，这个对象包含了常用的预定义的语言高亮配置，如 js,ts,go,css等等
      // 为什么不导入全量的高亮语言配置是因为全量的配置太大了，只导入常用的语言高亮配置就够了，这样可以减少打包出来的体积
      ...common,

      // 默认common配置中没有以下几个语言高亮配置，这里我们自己加上
      dart: dart, // flutter代码会用到dart
      nginx: nginx, // nginx配置文件高亮
      asciidoc: asciidoc, // asciidoc高亮, 控制台输出信息高亮（类似把 npm run dev 后输出的控制台信息可以进行高亮）
    },
  }),
  mediumZoom(),
  headingIdPlugin(),
  codeCopyPlugin(),
];

export const sanitizeMarkdownSchema: NonNullable<ViewerProps["sanitize"]> = (
  schema,
) => {
  schema.tagNames = Array.from(new Set([...(schema.tagNames ?? []), "iframe"]));
  schema.attributes = {
    ...schema.attributes,
    iframe: Array.from(
      new Set([...(schema.attributes?.iframe ?? []), ...iframeAttributes]),
    ),
  };

  return schema;
};
