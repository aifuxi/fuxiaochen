import type { AnyExtension } from "@tiptap/core";

import Image from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import StarterKit from "@tiptap/starter-kit";

import { safeContentUrl } from "./content-url";

function imageDimension(attribute: "width" | "height") {
  return {
    default: null,
    parseHTML: (element: HTMLElement) => {
      const value = Number(element.getAttribute(attribute));
      return Number.isInteger(value) && value >= 1 && value <= 10_000 ? value : null;
    },
  };
}

// 编辑、校验及服务端渲染共用节点定义，避免打开文档时丢失不认识的节点。
export function contentExtensions({ codeBlock }: { codeBlock?: AnyExtension } = {}) {
  return [
    StarterKit.configure({
      ...(codeBlock ? { codeBlock: false as const } : {}),
      link: {
        openOnClick: false,
        isAllowedUri: (url) => safeContentUrl(url),
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      },
    }),
    ...(codeBlock ? [codeBlock] : []),
    Image.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          width: imageDimension("width"),
          height: imageDimension("height"),
        };
      },
    }).configure({ inline: true, allowBase64: false }),
    TaskList,
    TaskItem.configure({
      nested: true,
      a11y: {
        checkboxLabel: (node, checked) =>
          `${checked ? "已完成" : "未完成"}任务：${node.textContent || "空任务"}`,
      },
    }),
    Table.configure({ resizable: false, renderWrapper: true }),
    TableRow,
    TableCell,
    TableHeader,
  ];
}
