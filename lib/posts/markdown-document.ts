import type { JSONContent } from "@tiptap/core";
import type { Definition, RootContent } from "mdast";

import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

import { safeContentUrl } from "./content-url";

type Mark = NonNullable<JSONContent["marks"]>[number];

const text = (value: string, marks: Mark[] = []): JSONContent[] =>
  value ? [{ type: "text", text: value, ...(marks.length ? { marks } : {}) }] : [];
const paragraph = (content: JSONContent[] = []): JSONContent => ({ type: "paragraph", content });

export function markdownDocument(markdown: string): JSONContent {
  const root = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const definitions = new Map<string, Definition>();
  for (const node of root.children)
    if (node.type === "definition") definitions.set(node.identifier.toLowerCase(), node);
  const source = (node: RootContent) =>
    markdown.slice(node.position?.start.offset ?? 0, node.position?.end.offset ?? markdown.length);
  const inline = (node: RootContent, marks: Mark[] = []): JSONContent[] => {
    switch (node.type) {
      case "text":
        return text(node.value, marks);
      case "html":
        return text(node.value, marks);
      case "break":
        return [{ type: "hardBreak" }];
      case "inlineCode":
        return text(node.value, [{ type: "code" }]);
      case "strong":
      case "emphasis":
      case "delete":
        return node.children.flatMap((child) =>
          inline(child, [
            ...marks,
            {
              type:
                node.type === "strong" ? "bold" : node.type === "emphasis" ? "italic" : "strike",
            },
          ]),
        );
      case "link":
      case "linkReference": {
        const target = node.type === "link" ? node : definitions.get(node.identifier.toLowerCase());
        const nextMarks =
          target && safeContentUrl(target.url)
            ? [...marks, { type: "link", attrs: { href: target.url, title: target.title ?? null } }]
            : marks;
        return node.children.flatMap((child) => inline(child, nextMarks));
      }
      case "image":
      case "imageReference": {
        const target =
          node.type === "image" ? node : definitions.get(node.identifier.toLowerCase());
        return target && safeContentUrl(target.url, true)
          ? [
              {
                type: "image",
                attrs: { src: target.url, alt: node.alt ?? "", title: target.title ?? null },
              },
            ]
          : text(source(node), marks);
      }
      default:
        return text(source(node), marks);
    }
  };
  const blocks = (nodes: RootContent[]): JSONContent[] =>
    nodes.flatMap((node): JSONContent[] => {
      switch (node.type) {
        case "paragraph":
          return [paragraph(node.children.flatMap((child) => inline(child)))];
        case "heading":
          return [
            {
              type: "heading",
              attrs: { level: node.depth },
              content: node.children.flatMap((child) => inline(child)),
            },
          ];
        case "code":
          return [
            {
              type: "codeBlock",
              attrs: { language: node.lang ?? null },
              content: text(node.value),
            },
          ];
        case "blockquote":
          return [{ type: "blockquote", content: blocks(node.children) }];
        case "thematicBreak":
          return [{ type: "horizontalRule" }];
        case "list": {
          // 混合普通项与任务项拆为相邻列表，保留每一项及原顺序。
          const result: JSONContent[] = [];
          node.children.forEach((item, index) => {
            const task = item.checked !== null && item.checked !== undefined;
            const type = task ? "taskList" : node.ordered ? "orderedList" : "bulletList";
            let list = result.at(-1);
            if (list?.type !== type) {
              list = {
                type,
                ...(type === "orderedList" ? { attrs: { start: (node.start ?? 1) + index } } : {}),
                content: [],
              };
              result.push(list);
            }
            const content = blocks(item.children);
            if (content[0]?.type !== "paragraph") content.unshift(paragraph());
            list.content!.push({
              type: task ? "taskItem" : "listItem",
              ...(task ? { attrs: { checked: item.checked } } : {}),
              content,
            });
          });
          return result;
        }
        case "table":
          return [
            {
              type: "table",
              content: node.children.map((row, rowIndex) => ({
                type: "tableRow",
                content: row.children.map((cell, index) => ({
                  type: rowIndex === 0 ? "tableHeader" : "tableCell",
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                    align: node.align?.[index] ?? null,
                  },
                  content: [paragraph(cell.children.flatMap((child) => inline(child)))],
                })),
              })),
            },
          ];
        case "definition":
          return [];
        // 未支持的语法保留源码文字，包括脚注；原始 HTML 始终作为文字。
        default:
          return [paragraph(text(source(node)))];
      }
    });
  const content = blocks(root.children);
  return { type: "doc", content: content.length ? content : [paragraph()] };
}
