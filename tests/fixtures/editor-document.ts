import type { JSONContent } from "@tiptap/core";

import { highlightColor, textColor } from "../../lib/posts/content-palette";

export const legacyEditorDocument: JSONContent = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "旧文章标题" }] },
    { type: "paragraph", content: [{ type: "text", text: "原有正文", marks: [{ type: "bold" }] }] },
    {
      type: "paragraph",
      content: [{ type: "image", attrs: { src: "https://images.example/old.png", alt: "旧图片" } }],
    },
  ],
};

// 覆盖编辑器、服务端校验、数据库保存和前台渲染之间容易丢失的属性。
export const richEditorDocument: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1, textAlign: "center" },
      content: [{ type: "text", text: "文档标题" }],
    },
    {
      type: "paragraph",
      attrs: { textAlign: "right" },
      content: [
        {
          type: "text",
          text: "七种叠加格式",
          marks: [
            { type: "bold" },
            { type: "italic" },
            { type: "underline" },
            { type: "strike" },
            { type: "link", attrs: { href: "https://example.com/" } },
            { type: "textStyle", attrs: { color: textColor("red") } },
            { type: "highlight", attrs: { color: highlightColor("yellow") } },
          ],
        },
      ],
    },
    {
      type: "callout",
      attrs: { tone: "orange" },
      content: [
        { type: "paragraph", content: [{ type: "text", text: "高亮块第一段" }] },
        { type: "paragraph", content: [{ type: "text", text: "高亮块第二段" }] },
      ],
    },
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: true },
          content: [{ type: "paragraph", content: [{ type: "text", text: "已完成任务" }] }],
        },
      ],
    },
    {
      type: "codeBlock",
      attrs: { language: "typescript" },
      content: [{ type: "text", text: "const answer = 42;" }],
    },
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [
            {
              type: "tableHeader",
              attrs: { colspan: 2, rowspan: 1, colwidth: [180, 0] },
              content: [{ type: "paragraph", content: [{ type: "text", text: "合并表头" }] }],
            },
          ],
        },
        {
          type: "tableRow",
          content: [
            {
              type: "tableCell",
              attrs: { colwidth: [180] },
              content: [{ type: "paragraph", content: [{ type: "text", text: "左侧" }] }],
            },
            {
              type: "tableCell",
              content: [{ type: "paragraph", content: [{ type: "text", text: "右侧" }] }],
            },
          ],
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "image",
          attrs: {
            src: "https://images.example/new.png",
            alt: "缩放图片",
            width: 240,
            height: 180,
          },
        },
      ],
    },
  ],
};
