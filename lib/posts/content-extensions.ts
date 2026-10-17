import type { AnyExtension } from "@tiptap/core";

import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";

import { Callout } from "./callout";
import { isTextColor, isHighlightColor } from "./content-palette";
import { safeContentUrl } from "./content-url";
import { applyTextAlignment } from "./text-alignment";

const ArticleTextAlign = TextAlign.extend({
  addCommands() {
    return {
      ...this.parent?.(),
      setTextAlign:
        (alignment: string) =>
        ({ tr, dispatch }) =>
          this.options.alignments.includes(alignment) &&
          applyTextAlignment(tr, alignment, Boolean(dispatch)),
      unsetTextAlign:
        () =>
        ({ tr, dispatch }) =>
          applyTextAlignment(tr, null, Boolean(dispatch)),
    };
  },
});

const ArticleColor = Color.extend({
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          color: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              isTextColor(element.style.color) ? element.style.color : null,
            renderHTML: ({ color }: { color?: string }) =>
              isTextColor(color) ? { style: `color: ${color}` } : {},
          },
        },
      },
    ];
  },
});
const ArticleHighlight = Highlight.extend({
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const color = element.getAttribute("data-color") || element.style.backgroundColor;
          return isHighlightColor(color) ? color : null;
        },
        renderHTML: ({ color }: { color?: string }) =>
          isHighlightColor(color)
            ? { "data-color": color, style: `background-color: ${color}; color: inherit` }
            : {},
      },
    };
  },
});

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
export function contentExtensions({
  codeBlock,
  editable = false,
}: { codeBlock?: AnyExtension; editable?: boolean } = {}) {
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
    TextStyle,
    ArticleColor,
    ArticleHighlight.configure({ multicolor: true }),
    ArticleTextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right"],
    }),
    Callout,
    Image.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          width: imageDimension("width"),
          height: imageDimension("height"),
        };
      },
      addNodeView() {
        const render = this.parent?.();
        if (!render) return null;
        return (props) => {
          const view = render(props);
          const update = view.update?.bind(view);
          // 3.31.4 的官方缩放视图仅在初始化时应用尺寸，补齐数字输入、撤销和恢复原图的同步。
          view.update = (node, decorations, innerDecorations) => {
            const accepted = update?.(node, decorations, innerDecorations) ?? false;
            if (accepted) {
              const image = view.dom.querySelector("img");
              if (image) {
                image.style.width = node.attrs.width ? `${node.attrs.width}px` : "";
                image.style.height = node.attrs.height ? `${node.attrs.height}px` : "";
              }
            }
            return accepted;
          };
          return view;
        };
      },
    }).configure({
      inline: true,
      allowBase64: false,
      resize: editable
        ? {
            enabled: true,
            directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
            minWidth: 50,
            minHeight: 50,
            alwaysPreserveAspectRatio: true,
          }
        : false,
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
      a11y: {
        checkboxLabel: (node, checked) =>
          `${checked ? "已完成" : "未完成"}任务：${node.textContent || "空任务"}`,
      },
    }),
    Table.configure({
      resizable: editable,
      renderWrapper: true,
      cellMinWidth: 60,
      allowTableNodeSelection: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
  ];
}
